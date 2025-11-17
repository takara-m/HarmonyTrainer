import { useState, useRef, useEffect } from 'react'
import styles from './AudioRecorder.module.css'

function AudioRecorder({ onRecordingComplete, existingAudio }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState(existingAudio || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    return () => {
      // クリーンアップ
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)

        // 親コンポーネントに録音データを渡す
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, url)
        }

        // ストリームを停止
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // タイマー開始
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            // 60秒で自動停止
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      console.error('録音の開始に失敗しました:', error)
      alert('マイクへのアクセスが許可されていません。\nブラウザの設定を確認してください。')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL(null)
    setRecordingTime(0)
    setIsPlaying(false)

    if (onRecordingComplete) {
      onRecordingComplete(null, null)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      {!audioURL ? (
        // 録音コントロール
        <div className={styles.recordingControl}>
          {!isRecording ? (
            <button className={styles.recordButton} onClick={startRecording}>
              <span className={styles.recordIcon}>🎤</span>
              <span className={styles.buttonText}>録音開始</span>
            </button>
          ) : (
            <div className={styles.recordingActive}>
              <div className={styles.waveAnimation}>
                <span className={styles.wave}></span>
                <span className={styles.wave}></span>
                <span className={styles.wave}></span>
              </div>
              <div className={styles.recordingInfo}>
                <span className={styles.recordingText}>録音中...</span>
                <span className={styles.timer}>{formatTime(recordingTime)}</span>
              </div>
              <button className={styles.stopButton} onClick={stopRecording}>
                <span className={styles.stopIcon}>⏹</span>
                <span className={styles.buttonText}>停止</span>
              </button>
            </div>
          )}
          <div className={styles.helpSection}>
            <p className={styles.helpText}>
              最大60秒まで録音できます
            </p>
            <div className={styles.tooltipContainer}>
              <button
                className={styles.helpButton}
                onClick={() => setShowTooltip(!showTooltip)}
                type="button"
              >
                ?
              </button>
              {showTooltip && (
                <div className={styles.tooltip}>
                  <button
                    className={styles.tooltipClose}
                    onClick={() => setShowTooltip(false)}
                  >
                    ×
                  </button>
                  <h4 className={styles.tooltipTitle}>📝 録音機能について</h4>
                  <p className={styles.tooltipText}>
                    この録音機能は外部マイク（入力デバイス）からの音声のみ対応しています。
                  </p>
                  <div className={styles.tooltipSection}>
                    <p className={styles.tooltipSubtitle}>❌ 録音できないもの：</p>
                    <ul className={styles.tooltipList}>
                      <li>システム内部の音源</li>
                      <li>再生中の音楽・動画の音声</li>
                      <li>PCやスマートフォンのスピーカー出力</li>
                    </ul>
                  </div>
                  <div className={styles.tooltipSection}>
                    <p className={styles.tooltipSubtitle}>⭐ 音楽を録音したい場合：</p>
                    <p className={styles.tooltipText}>
                      外部マイクを使用してスピーカーからの音を録音してください。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // 録音済み音声のプレビュー
        <div className={styles.audioPreview}>
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
          />
          <div className={styles.previewControls}>
            <button
              className={styles.playButton}
              onClick={isPlaying ? pauseAudio : playAudio}
            >
              <span className={styles.playIcon}>
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>
            <div className={styles.audioInfo}>
              <span className={styles.audioLabel}>録音済み</span>
              <span className={styles.audioDuration}>{formatTime(recordingTime)}</span>
            </div>
            <button className={styles.deleteButton} onClick={deleteRecording}>
              <span className={styles.deleteIcon}>🗑️</span>
              <span className={styles.buttonText}>削除</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
