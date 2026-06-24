import { useMemo, useState } from 'react'
import BasicGrid from '../components/Grid/BasicGrid.jsx'
import Pagination from '../components/Pagination/Pagination.jsx'
import rowDataJson from '../data/rowData.json'
import styles from './GridPage.module.css'

const PAGE_SIZE = 10

function GridPage() {
    const [allData] = useState(rowDataJson)
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.max(1, Math.ceil(allData.length / PAGE_SIZE))

    const sortedData = useMemo(() => {
        return [...allData].sort((a, b) =>
            a.department.localeCompare(b.department, 'ko')
        )
    }, [allData])

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
