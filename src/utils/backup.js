export const BACKUP_VERSION = '1.0'
export const APP_NAME = 'HarmonyTrainer'
export const MAX_RECOMMENDED_SIZE_MB = 50

export const calculateBackupSize = (songs, includeAudio = true) => {
  const songsToExport = includeAudio
    ? songs
    : songs.map(s => {
        const {audioData, audioFileName, ...songWithoutAudio} = s
        return songWithoutAudio
      })

  const jsonString = JSON.stringify(songsToExport)
  const sizeInBytes = new Blob([jsonString]).size
  const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)

  return {
    bytes: sizeInBytes,
    mb: parseFloat(sizeInMB),
    sizeText: `${sizeInMB}MB`
  }
}

export const createBackup = (songs, includeAudio = true) => {
  const songsToExport = includeAudio
    ? songs
    : songs.map(s => {
        const {audioData, audioFileName, ...songWithoutAudio} = s
        return songWithoutAudio
      })

  const audioCount = songs.filter(s => s.audioData).length
  const size = calculateBackupSize(songs, includeAudio)

  return {
    version: BACKUP_VERSION,
    exportDate: new Date().toISOString(),
    appName: APP_NAME,
    totalSongs: songs.length,
    songsWithAudio: audioCount,
    totalSize: size.sizeText,
    includesAudio: includeAudio,
    songs: songsToExport
  }
}

export const downloadBackup = (backupData, includeAudio = true) => {
  try {
    const jsonString = JSON.stringify(backupData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const filename = generateBackupFilename(includeAudio)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { success: true, filename }
  } catch (error) {
    console.error('Error downloading backup:', error)
    return { success: false, error: error.message }
  }
}

export const generateBackupFilename = (includeAudio = true) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const dateStr = `${year}${month}${day}`
  const timeStr = `${hours}${minutes}${seconds}`
  const audioSuffix = includeAudio ? '_full' : '_data'

  return `harmonytrainer_backup_${dateStr}_${timeStr}${audioSuffix}.json`
}

export const validateBackup = (backupData) => {
  const errors = []

  if (!backupData.version) {
    errors.push('バージョン情報がありません')
  }

  if (backupData.appName !== APP_NAME) {
    errors.push('このファイルはHarmonyTrainer用ではありません')
  }

  if (!Array.isArray(backupData.songs)) {
    errors.push('曲データの形式が不正です')
  }

  if (backupData.songs && Array.isArray(backupData.songs)) {
    backupData.songs.forEach((song, index) => {
      if (!song.id) errors.push(`曲${index + 1}: IDがありません`)
      if (!song.title) errors.push(`曲${index + 1}: タイトルがありません`)
      if (!Array.isArray(song.chords)) errors.push(`曲${index + 1}: コード進行が不正です`)
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const readBackupFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json')) {
      reject(new Error('JSONファイルを選択してください'))
      return
    }

    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      reject(new Error('ファイルサイズが大きすぎます（最大100MB）'))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result)
        const validation = validateBackup(backupData)

        if (!validation.isValid) {
          reject(new Error(validation.errors.join('\n')))
          return
        }

        resolve(backupData)
      } catch (error) {
        reject(new Error('JSONファイルの解析に失敗しました'))
      }
    }

    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'))
    }

    reader.readAsText(file)
  })
}

export const restoreBackup = (backupData) => {
  try {
    const validation = validateBackup(backupData)
    if (!validation.isValid) {
      return { success: false, errors: validation.errors }
    }

    localStorage.setItem('harmonytrainer_songs', JSON.stringify(backupData.songs))

    return {
      success: true,
      importedCount: backupData.songs.length,
      withAudio: backupData.songsWithAudio || 0
    }
  } catch (error) {
    console.error('Error restoring backup:', error)

    if (error.name === 'QuotaExceededError') {
      return { success: false, error: 'ストレージ容量が不足しています。音声ファイルなしのバックアップを使用してください。' }
    }

    return { success: false, error: error.message }
  }
}

export const getBackupMetadata = (backupData) => {
  return {
    version: backupData.version,
    exportDate: backupData.exportDate,
    totalSongs: backupData.totalSongs,
    songsWithAudio: backupData.songsWithAudio || 0,
    totalSize: backupData.totalSize,
    includesAudio: backupData.includesAudio
  }
}
