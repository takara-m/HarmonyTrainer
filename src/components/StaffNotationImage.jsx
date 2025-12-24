import { useState } from 'react'
import styles from './StaffNotationImage.module.css'

/**
 * キーに対応する五線譜画像を表示するコンポーネント
 * @param {string} keyName - キー (C, D, E, F, G, A, B)
 * @param {string} accidental - 臨時記号 ('', '♭', '♯')
 */
function StaffNotationImage({ keyName, accidental }) {
  const [imageError, setImageError] = useState(false)

  /**
   * ファイル名を生成
   * '♭' → 'b', '♯' → 's', '' → ''
   */
  const getImagePath = () => {
    if (!keyName) return null

    const accidentalMap = {
      '': '',
      '♭': 'b',
      '♯': 's'
    }

    const suffix = accidentalMap[accidental] || ''
    return `/images/keys/${keyName}${suffix}.png`
  }

  const imagePath = getImagePath()

  /**
   * 画像読み込みエラーハンドラ
   */
  const handleImageError = () => {
    setImageError(true)
  }

  // 画像パスがない、またはエラーが発生した場合
  if (!imagePath || imageError) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>
          五線譜画像が見つかりません
        </p>
        <p className={styles.errorHint}>
          ({keyName}{accidental}.png)
        </p>
      </div>
    )
  }

  return (
    <div className={styles.imageContainer}>
      <img
        src={imagePath}
        alt={`${keyName}${accidental}のスケール`}
        className={styles.staffImage}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  )
}

export default StaffNotationImage
