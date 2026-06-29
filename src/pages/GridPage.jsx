import { useCallback, useMemo, useRef, useState } from 'react'
import EmployeeGrid from '../components/Grid/EmployeeGrid.jsx'
import GridInfo from '../components/Grid/GridInfo.jsx'
import Pagination from '../components/Pagination/Pagination.jsx'
import rowDataJson from '../data/rowData.json'
import { addDepartmentSubtotals } from '../utils/addDepartmentSubtotals.js'
import { exportEmployeesExcel } from '../utils/exportEmployeesExcel.js'
import { sortEmployees } from '../utils/sortEmployees.js'
import styles from './GridPage.module.css'

function GridPage() {
    const [allData, setAllData] = useState(rowDataJson)   // 확정 데이터 (저장 후 반영)
    const [draftData, setDraftData] = useState(null)     // 편집 중 임시 데이터 (취소 시 폐기)
    const [isEditing, setIsEditing] = useState(false)    // 편집 모드 ON/OFF
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    // 부서 정렬 방향 : GridPage에서 전체 데이터를 정렬한 뒤 페이지를 자름
    const [deptSort, setDeptSort] = useState('asc')
    // 2차 정렬 — 부서 그룹 안에서만 (이름·금액·상태 등)
    const [secondaryField, setScondaryField] = useState(null)
    const [secondarySort, setSecondarySort] = useState(null)
    const editExitCancelRef = useRef(false) // true: 취소로 편집 종료, false: 저장으로 종료
    const gridControlRef = useRef(null)     // GridPage에서 AG Grid stopEditing API 호출용

    // 편집 중이면 draftData, 아니면 확정 데이터(allData)를 그리드에 표시
    const sourceData = isEditing && draftData != null ? draftData : allData

    // 정렬 + 부서별 합계 행 삽입
    const sortedData = useMemo(() => {
        const sorted = sortEmployees(sourceData, {
            deptSort,
            secondaryField,
            secondarySort,
        })
        return addDepartmentSubtotals(sorted)
    }, [sourceData, deptSort, secondaryField, secondarySort])

    const dataRowCount = useMemo(   // 총 건수
        () => sortedData.filter((row) => !row.isSummary).length,
        [sortedData],
    )

    // 그리드 헤더 정렬 변경 → GridPage state 반영 (1차: 부서, 2차: 선택 열)
    const handleSortChange = useCallback((updates) => {
        if (updates.deptSort) setDeptSort(updates.deptSort)
        if ('secondaryField' in updates) setScondaryField(updates.secondaryField)
        if ('secondarySort' in updates) setSecondarySort(updates.secondarySort)
        setCurrentPage(1)
    }, [])

    // 현재 표 데이터를 엑셀 파일로 다운로드
    const handleExcelDownload = useCallback(() => {
        exportEmployeesExcel(sortedData)
    }, [sortedData])

    // 셀 값 변경 → draftData(임시)만 수정. status가 반려가 아니면 reason 초기화
    const handleCellEdit = useCallback((id, field, value) => {
        setDraftData((prev) => {
            if (!prev) return prev
            return prev.map((row) => {
                if (row.id !== id) return row
                const updated = { ...row, [field]: value }
                if (field === 'status' && value !== '반려') {
                    updated.reason = '-'
                }
                return updated
            })
        })
    }, [])

    // 편집 시작: allData 복사 → draftData 생성, 편집 모드 ON
    const handleEditStart = useCallback(() => {
        setDraftData(allData.map((row) => ({ ...row })))
        setIsEditing(true)
    }, [allData])

    // 저장: draftData → allData 확정 후 편집 모드 OFF (DB 연동 시 API 호출 위치)
    const handleSave = useCallback(() => {
        editExitCancelRef.current = false
        if (draftData != null) {
            setAllData(draftData)
        }
        setDraftData(null)
        setIsEditing(false)
    }, [draftData])

    // 취소: 입력 중인 셀 편집 버림(stopEditing true) + draftData 폐기 → allData로 복귀
    const handleCancel = useCallback(() => {
        editExitCancelRef.current = true
        gridControlRef.current?.stopEditing(true)
        setDraftData(null)
        setIsEditing(false)
    }, [])

    // 합계 행 포함된 전체 행 수 기준 (30 + 부서별 합계 4 = 34행 → 4페이지)
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))

    // 현재 페이지에 해당하는 행만 잘라서 그리드에 전달
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
                buttonWrap={
                    <>
                        <button
                            type="button"
                            className="commBtn primaryBtn"
                            onClick={isEditing ? handleSave : handleEditStart}
                        >
                            {isEditing ? '저장' : '편집'}
                        </button>
                        {isEditing && (
                            <button type="button" className="commBtn primaryLineBtn" onClick={handleCancel}>
                                취소
                            </button>
                        )}
                        <button type="button" className="commBtn downBtn" onClick={handleExcelDownload}>엑셀 다운로드</button>
                    </>
                }
            />
            <EmployeeGrid
                defaultColDef={{
                    resizable: true, // 사용자가 넓이를 드래그로 조절
                }}
                rowData={pagedRowData}
                isEditing={isEditing}
                onCellEdit={handleCellEdit}
                editExitCancelRef={editExitCancelRef}
                gridControlRef={gridControlRef}
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
