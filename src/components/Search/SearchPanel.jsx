import styles from './SearchPanel.module.css'

/**
 * 검색 조건 1줄 - label + 입력 영역
 * @example
 * <SearchPanel.Field label="검색어">
 *   <input type="text" ... />
 * </SearchPanel.Field>
 */
function Field({ label, className, children }) {
    return (
        <li className={[styles.col1, className].filter(Boolean).join(' ')}>
            <p className={styles.schTit}>{label}</p>
            {children}
        </li>
    )
}

/**
 * 검색 영역 공통 틀 - ul·초기화/검색 버튼만 담당, 조건은 SearchPanel.Field로 페이지별 주입
 */
function SearchPanel({ children, onSearch, onReset }) {
    return (
        <div className={styles.searchWrap}>
            <ul className={styles.searchBox}>{children}</ul>
            <div className={styles.schBtnWrap}>
                <button type="button" className="commBtn" onClick={onReset}>
                    초기화
                </button>
                <button type="button" className="commBtn primaryBtn" onClick={onSearch}>
                    검색
                </button>
            </div>
        </div>
    )
}

SearchPanel.Field = Field

export default SearchPanel
