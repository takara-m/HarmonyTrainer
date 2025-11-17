  import { useState } from 'react'
  import { useLocation, useNavigate, useParams } from 'react-router-dom'
  import AudioPlayer from '../components/AudioPlayer'
  import { saveSong, getSongById, fileToBase64 } from '../utils/storage'
  import styles from './Edit.module.css'

  const KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const ACCIDENTALS = ['', '♭', '♯']
  const DEGREES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  const CHORD_TYPES = ['', 'm', '7', 'm7', 'maj7', 'dim', 'aug']

  const initializeChords = (existingChords) => {
    if (existingChords && existingChords.length === 4) {
      return existingChords
    }
    return Array(4).fill(null).map(() => [
      { degree: '', type: '' },
      { degree: '', type: '' }
    ])
  }

  function Edit() {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const isNew = !id

    const song = id ? (getSongById(id) || location.state?.song) : { title: '', key: 'C', accidental: '', measures: 4
   }

    const [title, setTitle] = useState(song.title || '')
    const [selectedKey, setSelectedKey] = useState(song.key || 'C')
    const [selectedAccidental, setSelectedAccidental] = useState(song.accidental || '')
    const [chords, setChords] = useState(initializeChords(song.chords))
    const [selectedMeasure, setSelectedMeasure] = useState(null)
    const [selectedChordIndex, setSelectedChordIndex] = useState(null)
    const [audioData, setAudioData] = useState(song.audioData || null)
    const [audioFileName, setAudioFileName] = useState(song.audioFileName || null)

    const handleAudioUpload = async (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('音声ファイルを選択してください')
        return
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        alert('ファイルサイズは10MB以下にしてください')
        return
      }

      try {
        const base64Data = await fileToBase64(file)
        setAudioData(base64Data)
        setAudioFileName(file.name)
      } catch (error) {
        console.error('Error converting file to base64:', error)
        alert('ファイルの読み込みに失敗しました')
      }
    }

    const handleRemoveAudio = () => {
      setAudioData(null)
      setAudioFileName(null)
      // Reset file input
      const fileInput = document.getElementById('audioFileInput')
      if (fileInput) {
        fileInput.value = ''
      }
    }

    const handleMeasureChordSelect = (measureIndex, chordIndex) => {
      setSelectedMeasure(measureIndex)
      setSelectedChordIndex(chordIndex)
    }

    const handleDegreeSelect = (degree) => {
      if (selectedMeasure === null || selectedChordIndex === null) {
        alert('先に小節内のコード位置を選択してください')
        return
      }
      const newChords = [...chords]
      const currentChord = newChords[selectedMeasure][selectedChordIndex]
      newChords[selectedMeasure][selectedChordIndex] = { ...currentChord, degree }
      setChords(newChords)
    }

    const handleTypeSelect = (type) => {
      if (selectedMeasure === null || selectedChordIndex === null) {
        alert('先に小節内のコード位置を選択してください')
        return
      }
      const currentChord = chords[selectedMeasure][selectedChordIndex]
      if (!currentChord.degree) {
        alert('先に度数を選択してください')
        return
      }
      const newChords = [...chords]
      newChords[selectedMeasure][selectedChordIndex] = { ...currentChord, type }
      setChords(newChords)
    }

    const handleSave = () => {
      if (!title.trim()) {
        alert('曲名を入力してください')
        return
      }

      const songData = {
        id: id || undefined,
        title: title.trim(),
        key: selectedKey,
        accidental: selectedAccidental,
        measures: 4,
        chords: chords,
        audioData: audioData,
        audioFileName: audioFileName
      }

      const success = saveSong(songData)
      if (success) {
        alert('保存しました！')
        navigate('/songs')
      } else {
        alert('保存に失敗しました')
      }
    }

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/songs')}>
            ← 戻る
          </button>
          <h1 className={styles.title}>
            {isNew ? '新しい曲を追加' : '曲を編集'}
          </h1>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <label className={styles.label}>曲名</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="曲名を入力"
            />
          </section>

          <section className={styles.section}>
            <label className={styles.label}>キー</label>
            <div className={styles.optionsRow}>
              {KEYS.map((key) => (
                <button
                  key={key}
                  className={`${styles.optionButton} ${selectedKey === key ? styles.optionButtonSelected : ''}`}
                  onClick={() => setSelectedKey(key)}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className={styles.accidentalRow}>
              {ACCIDENTALS.map((acc) => (
                <button
                  key={acc || 'natural'}
                  className={`${styles.accidentalButton} ${selectedAccidental === acc ?
  styles.accidentalButtonSelected : ''}`}
                  onClick={() => setSelectedAccidental(acc)}
                >
                  {acc || 'なし'}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <label className={styles.label}>コード進行</label>
            <div className={styles.measuresGrid}>
              {chords.map((measure, measureIndex) => (
                <div key={measureIndex} className={styles.measureContainer}>
                  <div className={styles.measureLabel}>{measureIndex + 1}小節目</div>
                  <div className={styles.chordPairRow}>
                    {measure.map((chord, chordIndex) => {
                      const displayText = chord.degree ? chord.degree + chord.type : '?'
                      const isSelected = selectedMeasure === measureIndex && selectedChordIndex === chordIndex

                      return (
                        <button
                          key={chordIndex}
                          className={`${styles.chordBox} ${isSelected ? styles.chordBoxSelected : ''}`}
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

          <section className={styles.section}>
            <label className={styles.label}>音声ファイル</label>
            <input
              type="file"
              id="audioFileInput"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="audioFileInput" className={styles.uploadButton}>
              ファイルを選択
            </label>
            {audioFileName && (
              <div className={styles.uploadedFile}>
                <span className={styles.fileName}>{audioFileName}</span>
                <button className={styles.removeButton} onClick={handleRemoveAudio}>
                  削除
                </button>
              </div>
            )}
            <p className={styles.helperText}>
              対応形式: MP3, WAV, M4A, OGG など（最大10MB）
            </p>
          </section>

          <div className={styles.actionButtons}>
            <button className={styles.saveButton} onClick={handleSave}>
              保存
            </button>
            <button className={styles.cancelButton} onClick={() => navigate('/')}>
              キャンセル
            </button>
          </div>

          {audioData && (
            <section className={styles.section}>
              <AudioPlayer audioData={audioData} />
            </section>
          )}
        </main>
      </div>
    )
  }

  export default Edit