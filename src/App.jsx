import React from 'react'
import _ from 'lodash'
import { css } from 'emotion'
import { darken } from 'polished'
import './App.css'

import { DICES } from './constants'
import DICTIONARY from './data/words_dictionary.json'

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

const getWordLength = word => {
  const wordBeforeQTransform = word.replace(/qu/g, 'q')
  return wordBeforeQTransform.length
}

const checkWord = word => {
  if (!word || getWordLength(word) < 3) {
    return false
  }

  return DICTIONARY[word] === 1
}

const getPatternHash = (pattern) => pattern.map(({ row, col }) => `${row}:${col}`).join('-')

const getScoreForWord = (isValid, wordLength) => {
  if (!isValid) {
    return -2
  }

  const SCORE_MAP = {
    '3': 1,
    '4': 1,
    '5': 2,
    '6': 3,
    '7': 5,
  }

  return SCORE_MAP[wordLength] || 11
}

class App extends React.Component {
  state = {
    board: generateRandomBoard(),
    pattern: [],

    score: 0,

    // TODO: can just store used patterns and derive these 2 from that state
    usedPatternHashes: [],
    usedWords: [],
  }

  handleSubmitWord = () => {
    // Check the word against dictionary
    //
    // If it's there:
    // - save used pattern
    // - update score
    // - reset the pattern

    // If it's not there:
    // - update score
    // - reset the pattern

    // Mind the "Q rule"
    const pattern = this.state.pattern
    const patternHash = getPatternHash(pattern)

    const word = _.map(pattern, 'letter')
      .join('')
      .replace(/q/g, 'qu')

    const isWordValid = checkWord(word)
    const isPatternValid = !this.state.usedPatternHashes.find(hash => hash === patternHash)

    const isValid = isWordValid && isPatternValid

    const wordScore = getScoreForWord(isValid, word.length)
    const newScore = this.state.score + wordScore

    this.setState({
      score: newScore,
      pattern: [],
    })

    if (isWordValid) {
      this.setState(state => ({
        usedWords: [...state.usedWords, {
          word,
          score: wordScore,
         }],
      }))
    }

    if (isValid) {
      this.setState(state => ({
        usedPatternHashes: [...state.usedPatternHashes, patternHash],
      }))
    }
  }

  handleLetterClick = (row, col, letter) => {
    // If last letter was clicked?
    if (this.state.pattern.length > 0) {
      const lastCell = this.state.pattern[this.state.pattern.length - 1]
      if (lastCell.row === row && lastCell.col === col) {
        // Remove the last letter from the current pattern
        this.setState({ pattern: this.state.pattern.slice(0, this.state.pattern.length - 1) })
      }
    }

    if (!this.isCellValid(row, col)) {
      return
    }

    if (this.isCellSelected(row, col)) {
      return
    }

    const newPattern = [
      ...this.state.pattern,
      {
        letter,
        row,
        col,
      },
    ]

    this.setState({ pattern: newPattern })
  }

  isCellSelected = (row, col) =>
    !!this.state.pattern.find(({ row: r, col: c }) => r === row && c === col)

  isCellValid = (row, col) => {
    const { pattern } = this.state

    if (pattern.length === 0) {
      return true
    }

    const lastCell = pattern[pattern.length - 1]

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

    const unusedNeighbors = neighbors.filter(({ row, col }) => !this.isCellSelected({ row, col }))

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
              } else if (!this.isCellValid(rowIndex, colIndex)) {
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
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  renderCurrentWord = () => {
    return (
      <div className={css(`font-size: 20pt; font-weight: bold; padding: 10px;`)}>
        {this.state.pattern.map(letterInfo => letterInfo.letter).join('')}
      </div>
    )
  }

  renderToolbar = () => {
    const isSubmitEnabled = this.state.pattern.length < 3

    return (
      <div>
        <button onClick={this.handleSubmitWord} disabled={isSubmitEnabled}>
          Submit
        </button>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderBoard()}
        {this.renderCurrentWord()}
        <div className={css(`font-size: 20px; padding: 10px; `)}>Score: {this.state.score}</div>
        {this.renderToolbar()}

        {this.state.usedWords.length > 0 && (
          <div>
            <h3>Words history:</h3>
            <ul>
              {this.state.usedWords.map(({ word, score }, index) => (
                <li key={index}>{`${word} (score: ${score})`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
}

export default App
