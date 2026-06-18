import styles from './Pagination.module.css'
import icoFirst from '../../assets/images/ico-first.svg'
import icoPrev from '../../assets/images/ico-prev.svg'
import icoNext from '../../assets/images/ico-next.svg'
import icoLast from '../../assets/images/ico-last.svg'

function Pagination({ currentPage, totalPages, onPageChange }){
    const safeTotalPages = Math.max(1, totalPages)  // totalPage가 0일때 최소 1이 되도록

    const goToPage = (page) => {
        if (page < 1 || page > safeTotalPages) return   // 범위 밖이면 무시
        if (page === currentPage) return            // 이미 그 페이지면 무시
        onPageChange(page)                          // 통과하면 부모에게 알림
    }

    // 예: 현재 페이지 기준으로 최대 10개 번호만 보여주기
    function getPageNumbers(currentPage, totalPages, maxVisible = 10) {
        const pages = []

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))   // 보여줄 첫 번호
        let end = start + maxVisible - 1                                             // 보여줄 마지막 번호

        if (end > totalPages) {     // 끝이 전체 페이지를 넘으면 오른쪽 끝에 맞춤
            end = totalPages
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        return pages
    }


    return (
        <div className={styles.pagination}>
            <button
                type="button"
                className={styles.navBtn}
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                aria-label="첫 페이지"
            >
                <img src={icoFirst} className={styles.pageArrowIcon} aria-hidden="true" />
            </button>
            <button
                type="button"
                className={styles.navBtn}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
            >
                <img src={icoPrev} className={styles.pageArrowIcon} aria-hidden="true" />
            </button>

            {/* 페이지 번호 */}
            <div className={styles.pageList}>
                {getPageNumbers(currentPage, safeTotalPages).map((page) => (
                    <button
                        key={page}
                        type="button"
                        className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`}
                        onClick={() => goToPage(page)}
                        aria-label={`${page}페이지`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                type="button"
                className={styles.navBtn}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === safeTotalPages}
                aria-label="다음 페이지"
            >
                <img src={icoNext} className={styles.pageArrowIcon} aria-hidden="true" />
            </button>
            <button
                type="button"
                className={styles.navBtn}
                onClick={() => goToPage(safeTotalPages)}
                disabled={currentPage === safeTotalPages}
                aria-label="마지막 페이지"
            >
                <img src={icoLast} className={styles.pageArrowIcon} aria-hidden="true" />
            </button>
        </div>
    )
}
export default Pagination