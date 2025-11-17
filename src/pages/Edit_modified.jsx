import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AudioRecorder from '../components/AudioRecorder'
import styles from './Edit.module.css'

const KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const MEASURE_OPTIONS = [1, 2, 3, 4]
const DEGREES = ['ー', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
const CHORD_TYPES = ['ー', 'M', 'm', '7', 'm7', 'maj7', 'dim', 'aug']

const initializeChords = (existingChords) => {
  if (existingChords && existingChords.length === 4) {
    return existingChords
  }
  return Array(4).fill(null).map(() => [
    { degree: 'ー', type: 'ー' },
    { degree: 'ー', type: 'ー' }
  ])
}

function Edit() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isNew = !id
  const song = location.state?.song || { title: '', key: 'C', measures: 4 }

  const [title, setTitle] = useState(song.title)
  const [selectedKey, setSelectedKey] = useState(song.key)
  const [measures, setMeasures] = useState(song.measures)
  const [chords, setChords] = useState(initializeChords(song.chords))
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioURL, setAudioURL] = useState(null)

  const handleRecordingComplete = (blob, url) => {
    setAudioBlob(blob)
    setAudioURL(url)
  }

  const handleChordChange = (measureIndex, chordIndex, field, value) => {
    const newChords = [...chords]
    newChords[measureIndex][chordIndex] = {
      ...newChords[measureIndex][chordIndex],
      [field]: value
    }
    setChords(newChords)
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('曲名を入力してください')
      return
    }

    const audioInfo = audioURL ? '\n音声: 録音済み' : '\n音声: なし'
    const chordInfo = chords.map((measure, i) => {
      const chordsText = measure.map(c => 
        c.degree === 'ー' ? '未入力' : c.degree + (c.type === 'ー' ? '' : c.type)
      ).join(', ')
      return '\n' + (i + 1) + '小節: ' + chordsText
    }).join('')

    alert('保存完了\n曲名: ' + title + '\nキー: ' + selectedKey + '\n小節数: ' + measures + chordInfo + audioInfo)
    navigate('/songs')
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
                className={styles.optionButton + (selectedKey === key ? ' ' + styles.optionButtonSelected : '')}
                onClick={() => setSelectedKey(key)}
              >
                {key}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <label className={styles.label}>小節数</label>
          <div className={styles.optionsRow}>
            {MEASURE_OPTIONS.map((num) => (
              <button
                key={num}
                className={styles.optionButton + (measures === num ? ' ' + styles.optionButtonSelected : '')}
                onClick={() => setMeasures(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <label className={styles.label}>コード進行</label>
          <div className={styles.chordProgressionGrid}>
            {chords.map((measure, measureIndex) => (
              <div key={measureIndex} className={styles.measureBox}>
                <div className={styles.measureLabel}>
                  {measureIndex + 1}小節目
                </div>
                <div className={styles.measureBar}>
                  <span className={styles.barLine}>｜</span>
                  <div className={styles.chordsInMeasure}>
                    {measure.map((chord, chordIndex) => (
                      <div key={chordIndex} className={styles.chordPair}>
                        <select
                          className={styles.degreeSelect}
                          value={chord.degree}
                          onChange={(e) => handleChordChange(measureIndex, chordIndex, 'degree', e.target.value)}
                        >
                          {DEGREES.map((deg) => (
                            <option key={deg} value={deg}>{deg}</option>
                          ))}
                        </select>
                        <select
                          className={styles.typeSelect}
                          value={chord.type}
                          onChange={(e) => handleChordChange(measureIndex, chordIndex, 'type', e.target.value)}
                        >
                          {CHORD_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <span className={styles.barLine}>｜</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <label className={styles.label}>音声ファイル</label>
          <button className={styles.uploadButton}>
            ファイルを選択（未実装）
          </button>
          <p className={styles.helperText}>
            ※ 音声アップロード機能は今後実装予定
          </p>
        </section>

        <section className={styles.section}>
          <label className={styles.label}>録音</label>
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            existingAudio={audioURL}
          />
        </section>

        <div className={styles.actionButtons}>
          <button className={styles.saveButton} onClick={handleSave}>
            保存
          </button>
          <button className={styles.cancelButton} onClick={() => navigate('/')}>
            キャンセル
          </button>
        </div>
      </main>
    </div>
  )
}

export default Edit
