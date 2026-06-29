import styles from './GridInfo.module.css'

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50]

/** 그리드 상단 정보 - 총 건수·페이지 크기 select·버튼 영역 */
function GridInfo({ totalCount, pageSize, onPageSizeChange, buttonWrap }) {
    return (
        <div className={styles.gridInfo}>
            <div className={styles.leftBox}>
                <p className={styles.totalNm}>총 {totalCount}건</p>
            </div>
            <div className={styles.rightBox}>
                {buttonWrap && (
                    <div className={styles.buttonWrap}>
                        {buttonWrap}
                    </div>
                )}
                <select
                    className={styles.gridPageSize}
                    value={pageSize}
                    aria-label="페이지당 행 수"
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default GridInfo
