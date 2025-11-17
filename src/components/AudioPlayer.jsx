import { useState, useRef, useEffect } from 'react'
import styles from './AudioPlayer.module.css'

function AudioPlayer({ audioUrl, title }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl])

  useEffect(() => {
    // Reset when audio URL changes
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!audioUrl) return null

  return (
    <div className={styles.audioPlayer}>
      <audio ref={audioRef} src={audioUrl} />

      <div className={styles.playerContent}>
        <div className={styles.info}>
          <span className={styles.icon}>🎵</span>
          <span className={styles.title}>{title || '音声ファイル'}</span>
        </div>

        <div className={styles.controls}>
          <button
            className={styles.playButton}
            onClick={togglePlayPause}
            aria-label={isPlaying ? '停止' : '再生'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className={styles.timeInfo}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <span className={styles.timeSeparator}>/</span>
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>

          <input
            type="range"
            className={styles.seekBar}
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            step="0.1"
          />
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
