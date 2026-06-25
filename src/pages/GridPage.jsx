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
    // 부서 정렬 방향 : GridPage에서 전체 데이터를 정렬한 뒤 페이지를 자름
    const [deptSort, setDeptSort] = useState('asc')

    const sortedData = useMemo(() => {
        const sorted = [...allData].sort((a, b) => {
            const cmp = a.department.localeCompare(b.department, 'ko')
            return deptSort === 'asc' ? cmp : -cmp
        })
        return addDepartmentSubtotals(sorted)
    }, [allData, deptSort])

    const handleDeptSortChange = (sort) => {
        setDeptSort(sort)
        setCurrentPage(1)
    }

    // 합계 행 포함된 전체 행 수 기준 (30 + 부서별 합계 4 = 34행 → 4페이지)
    const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE))

    const pagedRowData = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE
        return sortedData.slice(start, start + PAGE_SIZE)
    }, [sortedData, currentPage])

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>AG Grid</h1>
            <ul className={styles.textBox}>
                <li>AG Grid 기본 연동 (rowData, columnDefs, enableCellSpan)</li>
                <li>부서별 그룹 : spanRows 세로 병합</li>
                <li>부서별 금액 합계 행 삽입 (addDepartmentSubtotals / isSummary)</li>
                <li>합계 행 가로 병합 : colSpan + valueGetter / valueFormatter (금액 원 단위)</li>
                <li>부서 열 정렬 (오름·내림차순) : GridPage 전체 정렬 후 페이지 분할</li>
                <li>합계 행 부서 그룹 맨 아래 고정 (postSortRows)</li>
                <li>커스텀 Pagination 연동 (PAGE_SIZE 10, 합계 행 포함 총 페이지 계산)</li>
            </ul>
            <BasicGrid
                defaultColDef={{
                    resizable: true, // 사용자가 넓이를 드래그로 조절
                }}
                rowData={pagedRowData}
                deptSort={deptSort}
                onDeptSortChange={handleDeptSortChange}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}

export default GridPage
