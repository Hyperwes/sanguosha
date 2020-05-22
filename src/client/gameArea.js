import * as classNames from 'classnames';
import React from 'react';
import { animated } from 'react-spring';
import SetModePanel from './setModePanel';
import AnimatedItems from './animatedItems';
import './gameArea.css';

// Standard margin between objects
const DELTA = 10;

// Number of pixels between info objects inside the character card to the character card's border
const INFO_DELTA = 4;

export default class GameArea extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mode: SetModePanel.DEFAULT_MODE,
        };
    }

    render() {
        const { G, ctx, moves, events, playerID, width, height, playerAreas, scaledWidth, scaledHeight } = this.props;
        const { mode } = this.state;
        const { roles, characters, healths, isAlive, deck, discard, hands, equipment, harvest } = G;
        const { activePlayers, currentPlayer, numPlayers, playOrder } = ctx;

        const myPlayerIndex = Math.max(playOrder.indexOf(playerID), 0);
        const stage = activePlayers && activePlayers[playerID];

        // regular nodes to render
        const backNodes = [];
        const frontNodes = [];

        // render the three starting characters (select one)
        const characterCards = [];
        if (stage === 'selectCharacter') {
            this.addCharacterChoices(characterCards);
        }

        // Render the deck
        const playerCards = [];
        const DECK_RATIO = 0.5;
        if (deck.length > 0) {
            const MAX_CARDS_SHOWN = 10;
            deck.slice(-MAX_CARDS_SHOWN).forEach((card, j) => {
                let onClick = undefined;
                if (mode === SetModePanel.DEFAULT_MODE && card === deck[deck.length - 1]) {
                    onClick = () => moves.draw();
                }
                playerCards.push({
                    key: `card-${card.id}`,
                    name: card.type,
                    faceUp: false,
                    opacity: 1,
                    left: DELTA * (1 - j / MAX_CARDS_SHOWN),
                    top: height - scaledHeight * DECK_RATIO - DELTA * (j / MAX_CARDS_SHOWN),
                    width: scaledWidth * DECK_RATIO,
                    height: scaledHeight * DECK_RATIO,
                    onClick,
                });
            });
        }

        const healthPoints = [];
        playerAreas.forEach((playerArea, i) => {
            const playerIndex = (myPlayerIndex + i) % numPlayers;
            const player = playOrder[playerIndex];

            // Render each character back
            const character = characters[playerIndex];
            backNodes.push(<img
                key={`character-back-${i}`}
                className='positioned'
                src={`./characters/Character Back.jpg`}
                alt='Character Back'
                style={{
                    left: playerArea.x,
                    top: playerArea.y,
                    width: scaledWidth,
                    height: scaledHeight,
                }}
            />);
            if (!character) {
                return;
            }

            // Render each player's character
            characterCards.push({
                key: character ? `character-${character.name}` : `character-back-${i}`,
                name: character ? character.name : 'Character Back',
                opacity: isAlive[player] ? 1 : 0.5,
                left: playerArea.x,
                top: playerArea.y,
            });

            // Render the player's health
            for (let j = 0; j < healths[player].max; j++) {
                const color = j < healths[player].current ? 'green' : 'red';
                healthPoints.push({
                    key: `health-${i}-${j}-${color}`,
                    color,
                    left: playerArea.x + scaledWidth * (0.23 + j * 0.06),
                    top: playerArea.y + scaledHeight * 0.01,
                    width: scaledWidth * 0.06,
                    height: scaledHeight * 0.05,
                });
            }

            // Render buttons to increase or decrease my own health
            if (player === playerID) {
                if (healths[playerID].current > 0) {
                    frontNodes.push(<div
                        key='decrease-health'
                        className='positioned image-div selectable decrease-health'
                        style={{
                            left: playerArea.x + scaledWidth * 0.23,
                            top: playerArea.y + scaledHeight * 0.1,
                            width: scaledWidth * 0.12,
                            height: scaledHeight * 0.1,
                        }}
                        onClick={() => moves.updateHealth(-1)}
                    />);
                } else if (isAlive[playerID]) {
                    const DIE_BUTTON_WIDTH = 180;
                    const DIE_BUTTON_HEIGHT = 30;
                    frontNodes.push(<button
                        key='die'
                        className={`positioned selectable bad`}
                        style={{
                            left: (width - DIE_BUTTON_WIDTH) / 2,
                            top: (height - DIE_BUTTON_HEIGHT) / 2,
                            width: DIE_BUTTON_WIDTH,
                            height: DIE_BUTTON_HEIGHT,
                        }}
                        onClick={() => moves.die()}
                    >
                        {'Die and leave game'}
                    </button>);
                }
                if (healths[playerID].current < healths[playerID].max) {
                    frontNodes.push(<div
                        key='increase-health'
                        className='positioned image-div selectable increase-health'
                        style={{
                            left: playerArea.x + scaledWidth * 0.39,
                            top: playerArea.y + scaledHeight * 0.1,
                            width: scaledWidth * 0.12,
                            height: scaledHeight * 0.1,
                        }}
                        onClick={() => moves.updateHealth(+1)}
                    />);
                }
            }

            // Render "Save me!" if the player is dying
            if (isAlive[player] && healths[player].current <= 0) {
                const SAVE_ME_WIDTH = 100; // pixels
                const SAVE_ME_HEIGHT = 25; // pixels
                frontNodes.push(<button
                    key='save-me'
                    className='positioned bad'
                    style={{
                        left: playerArea.x + (scaledWidth - SAVE_ME_WIDTH) / 2,
                        top: playerArea.y + (scaledHeight - SAVE_ME_HEIGHT) / 2,
                        width: SAVE_ME_WIDTH,
                        height: SAVE_ME_HEIGHT,
                    }}
                    disabled={true}
                >
                    {'Save me!'}
                </button>);
            }

            // Ratio of role card size in top right of character card, to character card size
            const ROLE_RATIO = 0.25;
            const role = roles[playerIndex];
            const roleName = role.name || 'Role Back';
            frontNodes.push(<img
                key={`role-${role.id}`}
                className='positioned'
                src={`./roles/${roleName}.jpg`}
                alt={roleName}
                style={{
                    left: playerArea.x + (1 - ROLE_RATIO) * scaledWidth - INFO_DELTA,
                    top: playerArea.y + INFO_DELTA,
                    width: scaledWidth * ROLE_RATIO,
                    height: scaledHeight * ROLE_RATIO,
                }}
            />);

            // Show player's equipment
            const CARD_RATIO = 0.3;
            ['Weapon', 'Shield', '+1', '-1'].forEach((category, j) => {
                const card = equipment[player][category];
                if (card) {
                    let onClick = undefined;
                    if (player === playerID || mode === SetModePanel.DISMANTLE_MODE) {
                        onClick = () => {
                            moves.dismantle({
                                playerID: player,
                                category,
                            });
                            this.setState({ mode: SetModePanel.DEFAULT_MODE });
                        };
                    }
                    playerCards.push({
                        key: `card-${card.id}`,
                        className: 'small-shadow',
                        name: card.type,
                        faceUp: true,
                        opacity: 1,
                        left: playerArea.x + (scaledWidth - (CARD_RATIO * scaledWidth + INFO_DELTA) * (2 - j % 2)),
                        top: playerArea.y + (scaledHeight - (CARD_RATIO * scaledHeight + INFO_DELTA) * (2 - Math.floor(j / 2))),
                        width: scaledWidth * CARD_RATIO,
                        height: scaledHeight * CARD_RATIO,
                        onClick,
                    });
                }
            });

            // Show other player's hands
            if (player !== playerID) {
                const hand = hands[player];
                // Show the card backs
                hand.forEach(card => {
                    let onClick = undefined;
                    if (mode === SetModePanel.DISMANTLE_MODE) {
                        onClick = () => {
                            moves.dismantle({
                                playerID: player,
                                index: Math.floor(Math.random() * hand.length),
                            });
                            this.setState({ mode: SetModePanel.DEFAULT_MODE });
                        };
                    }
                    playerCards.push({
                        key: `card-${card.id}`,
                        className: 'small-shadow',
                        name: card.type,
                        faceUp: false,
                        opacity: 1,
                        left: playerArea.x + INFO_DELTA,
                        top: playerArea.y + (1 - CARD_RATIO) * scaledHeight - INFO_DELTA,
                        width: scaledWidth * CARD_RATIO,
                        height: scaledHeight * CARD_RATIO,
                        onClick,
                    });
                });
                // Show the card count
                if (hand.length > 0) {
                    frontNodes.push(<div
                        key={`card-count-${i}`}
                        className='game-label'
                        style={{
                            left: playerArea.x + INFO_DELTA,
                            top: playerArea.y + (1 - CARD_RATIO) * scaledHeight - INFO_DELTA,
                            width: scaledWidth * CARD_RATIO,
                            height: scaledHeight * CARD_RATIO,
                            marginLeft: scaledWidth * CARD_RATIO * 0.1,
                            marginTop: scaledWidth * CARD_RATIO * 0.1,
                            fontSize: scaledWidth * CARD_RATIO * 0.6,
                        }}
                    >
                        {hand.length}
                    </div>);
                }
            }
        });

        // Render discarded cards
        if (discard !== undefined) {
            const MAX_DISCARDS_SHOWN = 4;
            const DISCARD_RATIO = 0.7;
            const numCardsShown = Math.min(discard.length, MAX_DISCARDS_SHOWN);
            const startX = (width - numCardsShown * scaledWidth * DISCARD_RATIO - (numCardsShown - 1) * DELTA) / 2;
            for (let i = 0; i < discard.length && i <= MAX_DISCARDS_SHOWN; i++) {
                const card = discard[discard.length - 1 - i];
                let onClick = undefined;
                if (mode === SetModePanel.DEFAULT_MODE && i < MAX_DISCARDS_SHOWN && harvest.length === 0) {
                    onClick = () => moves.pickUp(discard.length - 1 - i);
                }
                playerCards.push({
                    key: `card-${card.id}`,
                    className: 'shadow',
                    name: card.type,
                    faceUp: true,
                    opacity: i === MAX_DISCARDS_SHOWN || harvest.length > 0 ? 0 : 1,
                    left: startX + (scaledWidth * DISCARD_RATIO + DELTA) * i,
                    top: (height - scaledHeight * DISCARD_RATIO) / 2,
                    width: scaledWidth * DISCARD_RATIO,
                    height: scaledHeight * DISCARD_RATIO,
                    onClick,
                });
            }
        }
        if (harvest !== undefined) {
            const HARVEST_RATIO = 0.7;
            const startX = (width - harvest.length * scaledWidth * HARVEST_RATIO - (harvest.length - 1) * DELTA) / 2;
            harvest.forEach((card, i) => {
                let onClick = undefined;
                if (mode === SetModePanel.DEFAULT_MODE) {
                    onClick = () => moves.pickUpHarvest(i);
                }
                playerCards.push({
                    key: `card-${card.id}`,
                    className: 'shadow',
                    name: card.type,
                    faceUp: true,
                    opacity: 1,
                    left: startX + (scaledWidth * HARVEST_RATIO + DELTA) * i,
                    top: (height - scaledHeight * HARVEST_RATIO) / 2,
                    width: scaledWidth * HARVEST_RATIO,
                    height: scaledHeight * HARVEST_RATIO,
                    onClick,
                });
            });
        }

        // render my player area
        backNodes.push(<div
            key='my-region'
            className='my-region'
            style={{
                height: scaledHeight + 2 * DELTA,
            }}
        />);
        // render my cards
        const myHand = hands[playerID];
        if (myHand) {
            const spacing = Math.min(scaledWidth + DELTA, (width - (2 + DECK_RATIO) * scaledWidth - 5 * DELTA) / (hands[playerID].length - 1));
            hands[playerID].forEach((card, i) => {
                let onClick = undefined;
                if (mode === SetModePanel.DEFAULT_MODE) {
                    onClick = () => (stage === 'play' ? moves.play : moves.discardCard)(i);
                } else if (mode === SetModePanel.DISMANTLE_MODE) {
                    onClick = () => {
                        moves.dismantle({
                            playerID,
                            index: i,
                        });
                        this.setState({ mode: SetModePanel.DEFAULT_MODE });
                    };
                }
                playerCards.push({
                    key: `card-${card.id}`,
                    name: card.type,
                    faceUp: true,
                    opacity: onClick !== undefined ? 1 : 0.3,
                    left: DECK_RATIO * scaledWidth + 2 * DELTA + spacing * i,
                    top: height - scaledHeight - DELTA,
                    width: scaledWidth,
                    height: scaledHeight,
                    onClick: onClick,
                });
            })
        }

        // render an "action button" to do something
        let actionButton = undefined;
        if (stage === 'play' && currentPlayer === playerID) {
            actionButton = {
                text: 'End turn',
                type: 'selectable warn',
                onClick: () => {
                    events.setStage('discard')

                    // endIf is only checked after move, so do a no-op
                    moves.doNothing();
                },
            }
        } else if (stage === 'discard') {
            actionButton = {
                text: 'Discard cards',
                type: 'disabled',
            };
        }
        if (isAlive[playerID] && actionButton !== undefined) {
            const ACTION_BUTTON_WIDTH = 160; // pixels
            const ACTION_BUTTON_HEIGHT = 30; // pixels
            const { text, type, onClick } = actionButton;
            backNodes.push(<button
                key='action-button'
                className={`positioned ${type}`}
                style={{
                    left: (width - ACTION_BUTTON_WIDTH) / 2,
                    top: height - scaledHeight - ACTION_BUTTON_HEIGHT - 3 * DELTA,
                    width: ACTION_BUTTON_WIDTH,
                    height: ACTION_BUTTON_HEIGHT,
                }}
                onClick={onClick}
                disabled={onClick === undefined}
            >
                {text}
            </button>);
        }

        backNodes.push(<SetModePanel
            key='set-mode-panel'
            mode={mode}
            setMode={mode => this.setState({ mode })}
            harvest={() => moves.harvest()}
        />);

        return <div>
            {backNodes}
            <AnimatedItems
                items={characterCards}
                from={_ => { return { opacity: 0 }; }}
                update={item => { return { opacity: item.opacity, left: item.left, top: item.top } }}
                clickable={true}
                animated={(item, props) => <animated.img
                    className='positioned item shadow'
                    src={`./characters/${item.name}.jpg`}
                    alt={item.name}
                    style={{
                        opacity: props.opacity,
                        left: props.left,
                        top: props.top,
                        width: scaledWidth,
                        height: scaledHeight,
                    }} />}
            />
            <AnimatedItems
                items={healthPoints}
                from={_ => { return { opacity: 0, left: 0, top: 0, width, height } }}
                update={item => { return { opacity: 1, left: item.left, top: item.top, width: item.width, height: item.height } }}
                animated={(item, props) => <animated.img
                    key={item.key}
                    className='positioned item'
                    src={`./health/health-${item.color}.png`}
                    alt='health'
                    style={{
                        opacity: props.opacity,
                        left: props.left,
                        top: props.top,
                        width: props.width,
                        height: props.height,
                    }}
                />}
            />
            <AnimatedItems
                items={playerCards}
                update={item => { return { faceUp: item.faceUp ? 1 : 0, opacity: item.opacity, left: item.left, top: item.top, width: item.width, height: item.height } }}
                clickable={true}
                animated={(item, props) => {
                    const { faceUp, opacity, left, top, width, height } = props;
                    return <animated.img
                        className={classNames('positioned', 'item', item.className)}
                        src={faceUp.interpolate(faceUp => faceUp > 0.5 ? `./cards/${item.name}.jpg` : './cards/Card Back.jpg')}
                        alt={'card'}
                        style={{
                            transform: faceUp.interpolate(faceUp => `rotateY(${faceUp * 180 - (faceUp > 0.5 ? 180 : 0)}deg)`),
                            opacity,
                            left,
                            top,
                            width,
                            height,
                        }}
                    />
                }}
            />
            {frontNodes}
        </div>;
    }

    addCharacterChoices(characterCards) {
        const { G, moves, playerID, width, height, scaledWidth, scaledHeight } = this.props;
        const { characterChoices } = G;
        const choices = characterChoices[playerID];
        if (choices !== undefined) {
            const startX = (width - choices.length * scaledWidth - (choices.length - 1) * DELTA) / 2;
            choices.forEach((choice, i) => {
                characterCards.push({
                    key: `character-${choice.name}`,
                    name: choice.name,
                    opacity: 1,
                    left: startX + (scaledWidth + DELTA) * i,
                    top: (height - scaledHeight) / 2,
                    onClick: () => moves.selectCharacter(i),
                });
            });
        }
    }
}
