import { useCallback, useMemo, useState } from 'react'
import BasicGrid from '../components/Grid/BasicGrid.jsx'
import GridInfo from '../components/Grid/GridInfo.jsx'
import Pagination from '../components/Pagination/Pagination.jsx'
import rowDataJson from '../data/rowData.json'
import { addDepartmentSubtotals } from '../utils/addDepartmentSubtotals.js'
import { sortEmployees } from '../utils/sortEmployees.js'
import styles from './GridPage.module.css'

function GridPage() {
    const [allData] = useState(rowDataJson)
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    // 부서 정렬 방향 : GridPage에서 전체 데이터를 정렬한 뒤 페이지를 자름
    const [deptSort, setDeptSort] = useState('asc')
    // 2차 정렬 — 부서 그룹 안에서만 (이름·금액·상태 등)
    const [secondaryField, setScondaryField] = useState(null)
    const [secondarySort, setSecondarySort] = useState(null)

    const sortedData = useMemo(() => {
        const sorted = sortEmployees(allData, {
            deptSort,
            secondaryField,
            secondarySort,
        })
        return addDepartmentSubtotals(sorted)
    }, [allData, deptSort, secondaryField, secondarySort])

    const dataRowCount = useMemo(   // 총 건수
        () => sortedData.filter((row) => !row.isSummary).length,
        [sortedData],
    )

    const handleSortChange = useCallback((updates) => {
        if (updates.deptSort) setDeptSort(updates.deptSort)
        if ('secondaryField' in updates) setScondaryField(updates.secondaryField)
        if ('secondarySort' in updates) setSecondarySort(updates.secondarySort)
        setCurrentPage(1)
    }, [])

    // 합계 행 포함된 전체 행 수 기준 (30 + 부서별 합계 4 = 34행 → 4페이지)
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))

    const pagedRowData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return sortedData.slice(start, start + pageSize)
    }, [sortedData, currentPage, pageSize])

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>AG Grid</h1>
            <ul className={styles.textBox}>
                <li>AG Grid 기본 연동 (rowData, columnDefs, enableCellSpan)</li>
                <li>부서별 그룹 : spanRows 세로 병합</li>
                <li>부서별 금액 합계 행 삽입 (addDepartmentSubtotals / isSummary)</li>
                <li>합계 행 가로 병합 : colSpan + valueGetter / valueFormatter (금액 원 단위)</li>
                <li>부서 1차 정렬 + 다른 열 2차 정렬 (부서 그룹 내)</li>
                <li>합계 행 부서 그룹 맨 아래 고정 (postSortRows)</li>
                <li>커스텀 Pagination 연동 (PAGE_SIZE 10, 합계 행 포함 총 페이지 계산)</li>
            </ul>
            <GridInfo totalCount={dataRowCount}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
            />
            <BasicGrid
                defaultColDef={{
                    resizable: true, // 사용자가 넓이를 드래그로 조절
                }}
                rowData={pagedRowData}
                deptSort={deptSort}
                secondaryField={secondaryField}
                secondarySort={secondarySort}
                onSortChange={handleSortChange}
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
