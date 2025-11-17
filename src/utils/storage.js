const STORAGE_KEY = 'harmonytrainer_songs'

const INITIAL_SONGS = [
  {
    id: '1',
    title: 'カノン進行',
    key: 'C',
    accidental: '',
    measures: 4,
    chords: [
      [{ degree: 'I', type: '' }, { degree: 'V', type: '' }],
      [{ degree: 'VI', type: 'm' }, { degree: 'III', type: 'm' }],
      [{ degree: 'IV', type: '' }, { degree: 'I', type: '' }],
      [{ degree: 'IV', type: '' }, { degree: 'V', type: '' }]
    ]
  },
  {
    id: '2',
    title: '王道進行',
    key: 'D',
    accidental: '',
    measures: 4,
    chords: [
      [{ degree: 'IV', type: '' }, { degree: 'V', type: '' }],
      [{ degree: 'III', type: 'm' }, { degree: 'VI', type: 'm' }],
      [{ degree: 'II', type: 'm' }, { degree: 'V', type: '' }],
      [{ degree: 'I', type: '' }, { degree: '', type: '' }]
    ]
  },
  {
    id: '3',
    title: 'ブルース進行',
    key: 'G',
    accidental: '',
    measures: 4,
    chords: [
      [{ degree: 'I', type: '7' }, { degree: 'I', type: '7' }],
      [{ degree: 'IV', type: '7' }, { degree: 'I', type: '7' }],
      [{ degree: 'V', type: '7' }, { degree: 'IV', type: '7' }],
      [{ degree: 'I', type: '7' }, { degree: 'V', type: '7' }]
    ]
  }
]

export const getSongs = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SONGS))
      return INITIAL_SONGS
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading songs:', error)
    return INITIAL_SONGS
  }
}

export const saveSong = (song) => {
  try {
    const songs = getSongs()
    const existingIndex = songs.findIndex(s => s.id === song.id)
    
    if (existingIndex >= 0) {
      songs[existingIndex] = song
    } else {
      const newId = Date.now().toString()
      songs.push({ ...song, id: newId })
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
    return true
  } catch (error) {
    console.error('Error saving song:', error)
    return false
  }
}

export const deleteSong = (id) => {
  try {
    const songs = getSongs()
    const filtered = songs.filter(s => s.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error deleting song:', error)
    return false
  }
}

export const getSongById = (id) => {
  const songs = getSongs()
  return songs.find(s => s.id === id)
}

export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }