import styles from './GridInfo.module.css'

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50]

function GridInfo({ totalCount, pageSize, onPageSizeChange }) {
    return (
        <div className={styles.gridInfo}>
            <div className={styles.leftBox}>
                <p className={styles.totalNm}>총 {totalCount}건</p>
            </div>
            <div className={styles.rightBox}>
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
