import React from 'react'
import _ from 'lodash'
import { css } from 'emotion'
import { darken } from 'polished'
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
    currentPattern: [],
  }

  handleLetterClick = (row, col, letter) => {
    if (!this.isCellValid(row, col)) {
      return
    }

    const newPattern = [...this.state.currentPattern, {
      letter,
      row,
      col,
    }]

    this.setState({ currentPattern: newPattern })
  }

  isCellSelected = (row, col) => !!this.state.currentPattern.find(({ row: r, col: c }) => r === row && c === col)

  isCellValid = (row, col) => {
    const { currentPattern} = this.state

    if (currentPattern.length === 0) {
      return true
    }

    const lastCell = currentPattern[currentPattern.length - 1]

    const neighbors = []
    _.range(-1, 2).forEach(rowStep => {
      _.range(-1, 2).forEach(colStep => {
        const neighborRow = lastCell.row + rowStep
        const neighborCol = lastCell.col + colStep
        if (neighborRow > 4 || neighborRow < 0) {
          return
        }
        if (neighborCol > 4 || neighborCol < 0) {
          return
        }

        if (rowStep === 0 && colStep === 0) {
          return
        }

        neighbors.push({
          row: neighborRow,
          col: neighborCol,
        })
      })
    })

    const unusedNeighbors = neighbors.filter(({row, col}) => !this.isCellSelected({ row, col }))

    return !!unusedNeighbors.find(({ row: r, col: c }) => r === row && c === col)
  }

  renderBoard = () => {
    const { board } = this.state

    return (
      <div>
        {board.map((row, rowIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={rowIndex} className={css(``)}>
            {row.map((letter, colIndex) => {
              let cellBackground = 'white'
              if (this.isCellSelected(rowIndex, colIndex)) {
                cellBackground = 'salmon'
              } else 

              if (!this.isCellValid(rowIndex, colIndex)) {
                cellBackground = 'gray'
              }

              return (
              <div
                // TODO: disable invalid cells
                onClick={() => this.handleLetterClick(rowIndex, colIndex, letter)}
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

                  background: ${cellBackground};

                  transition: background 0.3s;

                  &:hover {
                    background: ${darken(0.1, cellBackground)};
                  }
                  `,
                )}
              >
                {letter}
              </div>
            )})}
          </div>
        ))}
      </div>
    )
  }

  renderCurrentWord = () => {
    return (
      <div className={css(`font-size: 20pt; font-weight: bold; padding: 10px;`)}>
        {this.state.currentPattern.map((letterInfo) => letterInfo.letter).join('')}
      </div>
    )
  }

  render() {
    return <div>
      {this.renderBoard()}
      {this.renderCurrentWord()}
      </div>
  }
}

export default App
