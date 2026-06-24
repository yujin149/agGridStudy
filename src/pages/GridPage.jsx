import { useMemo, useState } from 'react'
import BasicGrid from '../components/Grid/BasicGrid.jsx'
import Pagination from '../components/Pagination/Pagination.jsx'
import rowDataJson from '../data/rowData.json'
import { addDepartmentSubtotals } from '../utils/addDepartmentSubtotals.js'
import styles from './GridPage.module.css'

const PAGE_SIZE = 10

function GridPage() {
    const [allData] = useState(rowDataJson)
    const [currentPage, setCurrentPage] = useState(1)

    const sortedData = useMemo(() => {
        const sorted = [...allData].sort((a, b) =>
            a.department.localeCompare(b.department, 'ko')
        )
        return addDepartmentSubtotals(sorted)
    }, [allData])

    // 합계 행 포함된 전체 행 수 기준 (30 + 부서별 합계 4 = 34행 → 4페이지)
    const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE))

    const pagedRowData = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE
        return sortedData.slice(start, start + PAGE_SIZE)
    }, [sortedData, currentPage])

    return (
        <div className={styles.page}>
            <BasicGrid rowData={pagedRowData} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}

export default GridPage
