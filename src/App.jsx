import React from 'react'
import _ from 'lodash'
import { css } from 'emotion'
import './App.css'

import { DICES } from './constants'

const generateRandomBoard = () => {
  const shuffledDice = _.shuffle(DICES)
  return _.range(5).map(row =>
    _.range(5).map(col => {
      const dice = shuffledDice[row * 5 + col]
      const letter = _.sample(dice)
      return letter
    }),
  )
}

class App extends React.Component {
  state = {
    board: generateRandomBoard(),
  }

  renderBoard = () => {
    const { board } = this.state

    return (
      <div>
        {board.map((row, rowIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={rowIndex} className={css(``)}>
            {row.map((letter, colIndex) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={colIndex}
                className={css(
                  `display: inline-flex; 
                  align-items: center; 
                  justify-content: center;
                  padding: 20px; 
                  font-size: 18pt; 
                  border: 1px solid black; 
                  cursor: pointer; 
                  width: 60px; height: 60px;

                  &:hover {
                    background: #bbb;
                  }
                  `,
                )}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  render() {
    return <div>{this.renderBoard()}</div>
  }
}

export default App
