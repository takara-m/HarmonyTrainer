 import styles from './ResultModal.module.css'

  function ResultModal({
    isOpen,
    onClose,
    onBack,
    onNextSong,
    correctAnswers,
    userAnswers,
    hasNextSong
  }) {
    if (!isOpen) return null

    // 正解数を計算（各小節2つのコード）
    let totalQuestions = 0
    let correctCount = 0

    correctAnswers.forEach((measureCorrect, measureIndex) => {
      const measureUser = userAnswers[measureIndex] || []
      measureCorrect.forEach((correct, chordIndex) => {
        const user = measureUser[chordIndex]
        totalQuestions++

        // 「ー」は空として扱い、正解にカウント
        if (correct.degree === 'ー') {
          if (!user || user.degree === 'ー' || !user.degree) {
            correctCount++
          }
        } else if (user && user.degree === correct.degree && user.type === correct.type && (user.degreeAccidental || '') === (correct.degreeAccidental || '')) {
          correctCount++
        }
      })
    })

    const isAllCorrect = correctCount === totalQuestions
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

    return (
      <div className={styles.overlay} onClick={onBack}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {isAllCorrect ? '🎉 Perfect!' : '結果発表'}
            </h2>
          </div>

          <div className={styles.content}>
            {/* スコア表示 */}
            <div className={styles.scoreSection}>
              <div className={styles.scoreCircle}>
                <span className={styles.scoreNumber}>{correctCount}</span>
                <span className={styles.scoreDivider}>/</span>
                <span className={styles.scoreTotal}>{totalQuestions}</span>
              </div>
              <p className={styles.scoreText}>
                正解率: {scorePercentage}%
              </p>
            </div>

            {/* 答え合わせ */}
            <div className={styles.answersSection}>
              <h3 className={styles.sectionTitle}>答え合わせ</h3>
              <div className={styles.answersGrid}>
                {correctAnswers.map((measureCorrect, measureIndex) => {
                  const measureUser = userAnswers[measureIndex] || []

                  return (
                    <div key={measureIndex} className={styles.measureCard}>
                      <div className={styles.measureNumber}>
                        {measureIndex + 1}<br />小<br />節<br />目
                      </div>
                      <div className={styles.measureContent}>
                        <div className={styles.chordsRow}>
                          {measureCorrect.map((correct, chordIndex) => {
                            const user = measureUser[chordIndex]

                            let isCorrect = false
                            if (correct.degree === 'ー') {
                              isCorrect = !user || user.degree === 'ー' || !user.degree
                            } else {
                              isCorrect = user && user.degree === correct.degree && user.type === correct.type && (user.degreeAccidental || '') === (correct.degreeAccidental || '')
                            }

                            const correctDisplay = correct.degree === 'ー' ? '（空）' : correct.degree + (correct.degreeAccidental || '') + correct.type
                            const userDisplay = !user || user.degree === 'ー' || !user.degree ? '（空）' : user.degree + (user.degreeAccidental || '') + user.type

                            return (
                              <div key={chordIndex} className={styles.chordColumn}>
                                <div className={styles.answerBox + ' ' + styles.userAnswer}>
                                  <span className={styles.answerLabel}>あなた</span>
                                  <span className={styles.answerValue}>{userDisplay}</span>
                                </div>
                                <div className={styles.answerBox + ' ' + styles.correctAnswer}>
                                  <span className={styles.answerLabel}>正解</span>
                                  <span className={styles.answerValue}>{correctDisplay}</span>
                                </div>
                                <div className={styles.resultIcon}>
                                  {isCorrect ? '✅' : '❌'}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className={styles.actions}>
            {hasNextSong && (
              <button className={styles.nextButton} onClick={onNextSong}>
                次の曲へ →
              </button>
            )}
            <button className={styles.continueButton} onClick={onBack}>
              前の画面に戻る
            </button>
            <button className={styles.backButton} onClick={onClose}>
              トップに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  export default ResultModal