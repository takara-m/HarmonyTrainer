  import { useState, useEffect } from 'react'
  import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
  import { getSongs, getSongById } from '../utils/storage'
  import ResultModal from '../components/ResultModal'
  import AudioPlayer from '../components/AudioPlayer'
  import styles from './Practice.module.css'

  const DEGREES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  const CHORD_TYPES = ['', 'm', '7', 'm7', 'maj7', 'dim', 'aug']

  function Practice() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const mode = searchParams.get('mode')
    const location = useLocation()
    const navigate = useNavigate()

    const [currentSong, setCurrentSong] = useState(null)
    const [selectedMeasure, setSelectedMeasure] = useState(null)
    const [selectedChordIndex, setSelectedChordIndex] = useState(null)
    const [userInput, setUserInput] = useState({})
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
      const song = getSongById(id) || location.state?.song
      if (song) {
        setCurrentSong(song)
      } else {
        const songs = getSongs()
        if (songs.length > 0) {
          setCurrentSong(songs[0])
        }
      }
      setSelectedMeasure(null)
      setSelectedChordIndex(null)
      setUserInput({})
      setShowModal(false)
    }, [id, location.state?.song])

    const handleMeasureChordSelect = (measureIndex, chordIndex) => {
      setSelectedMeasure(measureIndex)
      setSelectedChordIndex(chordIndex)
    }

    const handleDegreeSelect = (degree) => {
      if (selectedMeasure === null || selectedChordIndex === null) {
        alert('先に小節内のコード位置を選択してください')
        return
      }
      const key = selectedMeasure + '-' + selectedChordIndex
      const currentInput = userInput[key] || { degree: '', type: '' }
      setUserInput({
        ...userInput,
        [key]: { ...currentInput, degree },
      })
    }

    const handleTypeSelect = (type) => {
      if (selectedMeasure === null || selectedChordIndex === null) {
        alert('先に小節内のコード位置を選択してください')
        return
      }
      const key = selectedMeasure + '-' + selectedChordIndex
      const currentInput = userInput[key] || { degree: '', type: '' }
      if (!currentInput.degree) {
        alert('先に度数を選択してください')
        return
      }
      setUserInput({
        ...userInput,
        [key]: { ...currentInput, type },
      })
    }

    const getNextSong = () => {
      const songs = getSongs()
      const currentIndex = songs.findIndex(s => s.id === id)

      if (!mode) {
        return null
      }

      if (mode === 'random') {
        const otherSongs = songs.filter(s => s.id !== id)
        if (otherSongs.length === 0) return null
        return otherSongs[Math.floor(Math.random() * otherSongs.length)]
      } else if (mode === 'asc') {
        if (currentIndex < songs.length - 1) {
          return songs[currentIndex + 1]
        }
        return null
      } else if (mode === 'desc') {
        if (currentIndex > 0) {
          return songs[currentIndex - 1]
        }
        return null
      }
      return null
    }

    const handleCheckAnswer = () => {
      setShowModal(true)
    }

    const handleNextSong = () => {
      const nextSong = getNextSong()
      if (nextSong) {
        navigate('/practice/' + nextSong.id + '?mode=' + mode, {
          state: { song: nextSong }
        })
      } else {
        alert('お疲れ様でした！\n全ての曲が終了しました。')
        navigate('/')
      }
      setShowModal(false)
    }

    const handleBackModal = () => {
      setShowModal(false)
    }

    const handleCloseModal = () => {
      setShowModal(false)
      navigate('/')
    }

    if (!currentSong) {
      return (
        <div className={styles.container}>
          <div className={styles.main}>
            <p>曲が見つかりません</p>
          </div>
        </div>
      )
    }

    const correctAnswers = currentSong.chords || []

    const userAnswers = Array.from({ length: currentSong.measures || 4 }, (_, measureIndex) => {
      return [
        userInput[measureIndex + '-0'] || null,
        userInput[measureIndex + '-1'] || null
      ]
    })

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            ← 戻る
          </button>
          <h1 className={styles.title}>練習モード</h1>
        </header>

        <main className={styles.main}>
          <div className={styles.songInfoCard}>
            <h2 className={styles.songTitle}>{currentSong.title}</h2>
            <p className={styles.keyInfo}>キー: {currentSong.key}{currentSong.accidental || ''}</p>
            {mode && (
              <p className={styles.modeInfo}>
                モード: {mode === 'random' ? 'ランダム' : mode === 'asc' ? '昇順' : '降順'}
              </p>
            )}
          </div>


          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>コードを選択</h3>
            <div className={styles.measuresGrid}>
              {Array.from({ length: currentSong.measures || 4 }, (_, measureIndex) => (
                <div key={measureIndex} className={styles.measureContainer}>
                  <div className={styles.measureLabel}>{measureIndex + 1}小節目</div>
                  <div className={styles.chordPairRow}>
                    {[0, 1].map((chordIndex) => {
                      const key = measureIndex + '-' + chordIndex
                      const input = userInput[key]
                      const displayText = input && input.degree
                        ? input.degree + input.type
                        : '?'
                      const isSelected = selectedMeasure === measureIndex && selectedChordIndex === chordIndex

                      return (
                        <button
                          key={chordIndex}
                          className={styles.chordBox + (isSelected ? ' ' + styles.chordBoxSelected : '')}
                          onClick={() => handleMeasureChordSelect(measureIndex, chordIndex)}
                        >
                          <span className={styles.chordNumber}>{chordIndex + 1}</span>
                          <span className={styles.chordInput}>{displayText}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>度数を選択</h3>
            <div className={styles.degreeRow}>
              {DEGREES.map((degree) => (
                <button
                  key={degree}
                  className={styles.degreeButton}
                  onClick={() => handleDegreeSelect(degree)}
                >
                  {degree}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>コードタイプ（オプション）</h3>
            <div className={styles.typeRow}>
              {CHORD_TYPES.map((type) => (
                <button
                  key={type || 'major'}
                  className={styles.typeButton}
                  onClick={() => handleTypeSelect(type)}
                >
                  {type || 'メジャー'}
                </button>
              ))}
            </div>
          </section>

          <button className={styles.checkButton} onClick={handleCheckAnswer}>
            答え合わせ
          </button>

        {currentSong.audioData && (
          <AudioPlayer audioUrl={currentSong.audioData} title={currentSong.title} />
        )}
        </main>

        <ResultModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onBack={handleBackModal}
          onNextSong={handleNextSong}
          correctAnswers={correctAnswers}
          userAnswers={userAnswers}
          hasNextSong={!!getNextSong()}
        />
      </div>
    )
  }

  export default Practice
