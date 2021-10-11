import React from 'react';
import { ROLE_DIST } from '../lib/roles';
import './setModePanel.css';

export default class SetModePanel extends React.Component {

    static DEFAULT_MODE = 'Default';
    static GIVE_MODE = 'Give';
    static DISMANTLE_MODE = 'Dismantle';
    static STEAL_MODE = 'Steal';
    static REVEAL_MODE = 'Reveal';
    static FLIP_MODE = 'Flip';
    static HELP_MODE = 'Help';
    static SHOW_HOTKEYS_MODE = 'Hotkeys';
    static GIVE_JUDGMENT_MODE = 'Give Judgment';
    static COUNTRY_SCENE_MODE = 'Country Scene';
    static BLOCKADE_MODE = 'Blockade';
	static RECKLESS_ABANDON_MODE = 'Reckless Abandon';
    static ALLIANCE_MODE = 'Alliance';
	static HEAVENLY_ESSENCE_MODE = 'Heavenly Essence';
    static CARD_ON_CHAR_MODE = "Place card on self";
	static CARD_ON_DECK_MODE = "Put on top of deck";

    componentDidMount() {
        document.addEventListener('keydown', this.handleHotkey);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleHotkey);
    }

    render() {
        const { moves } = this.props;
        return <div className='set-mode-panel'>
            <div className='section'>
                {this.renderButton(SetModePanel.DEFAULT_MODE)}
                {this.renderButton(SetModePanel.GIVE_MODE)}
                {this.renderButton(SetModePanel.DISMANTLE_MODE)}
                {this.renderButton(SetModePanel.STEAL_MODE)}
                {this.renderButton(SetModePanel.REVEAL_MODE)}
                {this.renderButton(SetModePanel.FLIP_MODE)}
                {this.renderSpecialModeButton()}
                {this.renderButton(SetModePanel.HELP_MODE)}
                {this.renderButton(SetModePanel.SHOW_HOTKEYS_MODE)}
            </div>
            <div className='section'>
                <button
                    className='clickable'
                    onClick={() => moves.judgment()}
                >
                    {'Judgment'}
                </button>
                {this.renderHarvestButton()}
                <button
                    className='clickable'
                    onClick={() => moves.passLightning()}
                >
                    {'Lightning'}
                </button>
                {this.renderFinishDiscardButton()}
                {this.renderSpecialButton()}
                {this.renderAwakeningButton()}
                {this.renderHotkeys()}
            </div>
        </div>
    }

    renderButton(targetMode) {
        const { mode, setMode } = this.props;
        return <button
            className={mode === targetMode ? 'toggled' : 'selectable'}
            disabled={mode === targetMode}
            onClick={() => setMode(targetMode)}
        >
            {targetMode}
        </button>
    }

    renderHarvestButton() {
        const { G, moves } = this.props;
        const { harvest } = G;
        if (harvest.length === 0) {
            return <button
                className='clickable'
                onClick={() => moves.harvest()}
            >
                {'Harvest'}
            </button>;
        } else {
            return <button
                className='clickable'
                onClick={() => moves.finishHarvest()}
            >
                {'Finish'}
            </button>;
        }
    }

    renderFinishDiscardButton() {
        const { moves } = this.props;
        if (this.stage() === 'discard') {
            return <button
                className='clickable'
                onClick={() => moves.finishDiscard()}
            >
                {'No discard'}
            </button>
        }
    }

    renderSpecialModeButton() {
        const { G, playerID } = this.props;
        const { characters } = G;
        const character = characters[playerID];
        if (character === undefined) {
            return;
        }
        if (character.name === 'Da Qiao') {
            return this.renderButton(SetModePanel.COUNTRY_SCENE_MODE);
        }
        if (character.name === 'Xu Huang') {
            return this.renderButton(SetModePanel.BLOCKADE_MODE);
        }
		if (character.name === 'Han Hao & Shi Huan') {
			return this.renderButton(SetModePanel.RECKLESS_ABANDON_MODE);
		}
        if (character.name === 'Lu Su') {
            return this.renderButton(SetModePanel.ALLIANCE_MODE);
        }
		if (character.name === 'Wu Guo Tai') {
            return this.renderButton(SetModePanel.HEAVENLY_ESSENCE_MODE);
        }
        if (['Deng Ai', 'Zhou Tai', 'Xu Sheng', 'Yu Jin', 'Cheng Pu', 'Zhong Hui', 'Liu Feng'].includes(character.name)) {
            return this.renderButton(SetModePanel.CARD_ON_CHAR_MODE);
        }
		if (['Li Ru', 'Yu Fan'].includes(character.name)) {
            return this.renderButton(SetModePanel.CARD_ON_DECK_MODE);
        }
    }

    renderSpecialButton() {
        const { G, ctx, moves, playerID } = this.props;
        const { characters, privateZone } = G;
        const { currentPlayer } = ctx;
        const character = characters[playerID];
        if (character === undefined) {
            return;
        }
        if (['Zhuge Liang', 'Jiang Wei'].includes(character.name) && currentPlayer === playerID) {
            const doingAstrology = privateZone.filter(item => item.source.deck).length > 0;
            if (doingAstrology) {
                return <button
                    className='clickable'
                    onClick={() => moves.finishAstrology()}
                >
                    {'Finish'}
                </button>;
            } else {
                return <button
                    className='clickable'
                    onClick={() => moves.astrology()}
                >
                    {'Astrology'}
                </button>;
            }
        }
        if (character.name === 'Dong Zhuo') {
            return <button
                className='clickable'
                onClick={() => moves.collapse()}
            >
                {'Collapse'}
            </button>;
        }
    }

    renderAwakeningButton() {
        const { G, ctx, moves, playerID } = this.props;
        const { characters, privateZone } = G;
        const { currentPlayer } = ctx;
        const character = characters[playerID];
        if (character === undefined) {
            return;
        }
        if (['Deng Ai', 'Jiang Wei', 'Sun Ce', 'Zhong Hui'].includes(character.name)) {
            return <button
                className='clickable'
                onClick={() => moves.awaken()}
            >
                {'Awaken'}
            </button>;
        }
        if (['Liu Shan'].includes(character.name)) {
            return <button
                className='clickable'
                onClick={() => moves.reverseAwaken()}
            >
                {'Awaken'}
            </button>;
        }
    }

    renderHotkeys() {
        const { mode, setMode } = this.props;
        if (mode === SetModePanel.SHOW_HOTKEYS_MODE) {
            return <div
                className='hotkeys-panel'
            >
                {this.renderRoleDistribution()}
                <table><tbody></tbody></table>
                <div>Modifier hotkeys: press the hotkey to modify what your next click will do.</div>
                <table>
                    <tbody>
                        <tr>
                            <td>Esc</td>
                            <td>Return to default mode</td>
                        </tr>
                        <tr>
                            <td>G</td>
                            <td>Give your next selected card to someone else</td>
                        </tr>
                        <tr>
                            <td>D</td>
                            <td>Discard/dismantle your next selected card</td>
                        </tr>
                        <tr>
                            <td>S</td>
                            <td>Steal your next selected card into your hand</td>
                        </tr>
                        <tr>
                            <td>R</td>
                            <td>Reveal your next selected card to someone else</td>
                        </tr>
                        <tr>
                            <td>F</td>
                            <td>Flip your next selected card</td>
                        </tr>
                        <tr>
                            <td>H</td>
                            <td>Render help for the selected card</td>
                        </tr>
                    </tbody>
                </table>
                <div>Action hotkeys: press the hotkey to trigger an action immediately.</div>
                <table>
                    <tbody>
                        <tr>
                            <td>1-9</td>
                            <td>Play the Nth card in your hand</td>
                        </tr>
                        <tr>
                            <td>J</td>
                            <td>Flip over a judgment card from the deck</td>
                        </tr>
                        <tr>
                            <td>V</td>
                            <td>Turn over N cards from the deck for harvest</td>
                        </tr>
                        <tr>
                            <td>L</td>
                            <td>Pass lightning card to the next player</td>
                        </tr>
                        <tr>
                            <td>C</td>
                            <td>Draw a card into your hand</td>
                        </tr>
                        <tr>
                            <td>Q</td>
                            <td>Decrease your health by 1</td>
                        </tr>
                        <tr>
                            <td>W</td>
                            <td>Increase your health by 1</td>
                        </tr>
                        <tr>
                            <td>T</td>
                            <td>Toggle your chain state</td>
                        </tr>
                        <tr>
                            <td>E</td>
                            <td>End your play phase (and start discard phase)</td>
                        </tr>
                        <tr>
                            <td>N</td>
                            <td>No discard (force end turn without discarding)</td>
                        </tr>
                        <tr>
                            <td>?</td>
                            <td>Open this menu</td>
                        </tr>
                    </tbody>
                </table>
                <button
                    className='selectable'
                    onClick={() => setMode(SetModePanel.DEFAULT_MODE)}
                >
                    {'X'}
                </button>
            </div>;
        }
    }

    handleHotkey = e => {
        const { G, moves, setMode, selectFunction } = this.props;
        const { harvest } = G;
        if (e.altKey || e.ctrlKey || e.metaKey) {
            return;
        }
        switch (e.key) {
            case "Escape":
                setMode(SetModePanel.DEFAULT_MODE);
                break;
            case "g":
                setMode(SetModePanel.GIVE_MODE);
                break;
            case "d":
                setMode(SetModePanel.DISMANTLE_MODE);
                break;
            case "s":
                setMode(SetModePanel.STEAL_MODE);
                break;
            case "r":
                setMode(SetModePanel.REVEAL_MODE);
                break;
            case "f":
                setMode(SetModePanel.FLIP_MODE);
                break;
            case "h":
                setMode(SetModePanel.HELP_MODE);
                break;
            case "/":
            case "?":
                setMode(SetModePanel.SHOW_HOTKEYS_MODE);
                break;
            case "j":
                moves.judgment();
                break;
            case "v":
                (harvest.length === 0 ? moves.harvest : moves.finishHarvest)();
                break;
            case "l":
                moves.passLightning();
                break;
            case "c":
                moves.draw();
                break;
            case "q":
                moves.updateHealth(-1);
                break;
            case "w":
                moves.updateHealth(+1);
                break;
            case "t":
                moves.toggleChain();
                break;
            case "e":
                moves.endPlay();
                break;
            case "n":
                moves.finishDiscard();
                break;
            default:
                break;
        }
        if (e.keyCode >= 49 && e.keyCode <= 57) {
            const func = selectFunction(e.keyCode - 49);
            if (func) {
                func();
            }
        }
    };

    renderRoleDistribution() {
        const { ctx } = this.props;
        const { numPlayers } = ctx;
        const [numKings, numRebels, numLoyalists, numSpies] = ROLE_DIST[numPlayers];
        return <div>
            This game has {numKings} {numKings !== 1 ? 'kings' : 'king'},{' '}
            {numRebels} {numRebels !== 1 ? 'rebels' : 'rebel'},{' '}
            {numLoyalists} {numLoyalists !== 1 ? 'loyalists' : 'loyalist'}, and{' '}
            {numSpies} {numSpies !== 1 ? 'spies' : 'spy'}.
        </div>
    }

    stage() {
        const { ctx, playerID } = this.props;
        const { activePlayers } = ctx;
        return activePlayers && activePlayers[playerID];
    }
}
