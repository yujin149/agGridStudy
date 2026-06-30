import { useCallback, useMemo, useRef, useState } from 'react'
import {
    findFirstMissingRejectReasonId,
    hasMissingRejectReason,
    REJECT_REASON_REQUIRED_MSG,
    SAVE_CONFIRM_MSG,
} from '../components/Grid/reasonConfig.js'
import EmployeeGrid from '../components/Grid/EmployeeGrid.jsx'
import GridInfo from '../components/Grid/GridInfo.jsx'
import Pagination from '../components/Pagination/Pagination.jsx'
import SearchPanel from '../components/Search/SearchPanel.jsx'
import searchStyles from '../components/Search/SearchPanel.module.css'
import rowDataJson from '../data/rowData.json'
import { addDepartmentSubtotals } from '../utils/addDepartmentSubtotals.js'
import { exportEmployeesExcel } from '../utils/exportEmployeesExcel.js'
import { filterEmployees, STATUS_OPTIONS } from '../utils/filterEmployees.js'
import { sortEmployees } from '../utils/sortEmployees.js'
import styles from './GridPage.module.css'

const EDIT_MODE_SEARCH_MSG = '편집모드를 저장해주세요.' // 편집 중 검색·초기화 시 alert 문구

/** AG Grid 페이지 - 검색·데이터·정렬·페이지·편집(draft)·엑셀 다운로드 */
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
    const [searchKeyword, setSearchKeyword] = useState('')           // 검색 입력값 (검색 버튼 전)
    const [statusFilters, setStatusFilters] = useState(() => [...STATUS_OPTIONS]) // 상태 체크박스 선택
    const [appliedKeyword, setAppliedKeyword] = useState('')         // 적용된 검색어 (검색 버튼 후)
    const [appliedStatuses, setAppliedStatuses] = useState(() => [...STATUS_OPTIONS]) // 적용된 상태 필터
    const [editRowIds, setEditRowIds] = useState(null) // 편집 진입 시 검색 결과 행 id 고정 (상태 변경해도 목록 유지)
    const editExitCancelRef = useRef(false) // true: 취소로 편집 종료, false: 저장으로 종료
    const gridControlRef = useRef(null)     // GridPage에서 AG Grid stopEditing API 호출용
    const draftDataRef = useRef(null)       // 저장 직전 stopEditing 후 최신 draft 동기 참조

    // 편집 중이면 draftData, 아니면 확정 데이터(allData)를 그리드에 표시
    const sourceData = isEditing && draftData != null ? draftData : allData

    const isAllStatusSelected = statusFilters.length === STATUS_OPTIONS.length

    // 검색어·상태 필터·적용 조건·페이지를 초기 상태로 되돌림 (저장 완료·초기화 버튼 공용)
    const resetSearchConditions = useCallback(() => {
        setSearchKeyword('')
        setStatusFilters([...STATUS_OPTIONS])
        setAppliedKeyword('')
        setAppliedStatuses([...STATUS_OPTIONS])
        setCurrentPage(1)
    }, [])

    // 일반 모드: 적용된 검색 조건 / 편집 모드: 진입 시점 검색 결과 id만 고정 (상태 변경해도 유지)
    const filteredSource = useMemo(() => {
        if (isEditing && editRowIds != null) {
            const idSet = new Set(editRowIds)
            return sourceData.filter((row) => !row.isSummary && idSet.has(row.id))
        }
        return filterEmployees(sourceData, {
            keyword: appliedKeyword,
            statuses: appliedStatuses,
        })
    }, [sourceData, isEditing, editRowIds, appliedKeyword, appliedStatuses])

    // 정렬 + 부서별 합계 행 삽입
    const sortedData = useMemo(() => {
        const sorted = sortEmployees(filteredSource, {
            deptSort,
            secondaryField,
            secondarySort,
        })
        return addDepartmentSubtotals(sorted)
    }, [filteredSource, deptSort, secondaryField, secondarySort])

    // 엑셀: 검색 조건 없이 전체 확정 데이터 기준
    const excelExportData = useMemo(() => {
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

    // 그리드 헤더 정렬 변경 → GridPage state 반영 (1차: 부서, 2차: 선택 열)
    const handleSortChange = useCallback((updates) => {
        if (updates.deptSort) setDeptSort(updates.deptSort)
        if ('secondaryField' in updates) setScondaryField(updates.secondaryField)
        if ('secondarySort' in updates) setSecondarySort(updates.secondarySort)
        setCurrentPage(1)
    }, [])

    // 편집 모드에서 검색·초기화 차단 - true 반환 시 호출부에서 조기 return
    const blockSearchInEditMode = useCallback(() => {
        if (!isEditing) return false
        alert(EDIT_MODE_SEARCH_MSG)
        return true
    }, [isEditing])

    // 상태 '전체' 체크 - 전체 선택 시 모두 체크(필터 없음), 해제 시 모두 해제
    const handleAllStatusChange = useCallback((checked) => {
        setStatusFilters(checked ? [...STATUS_OPTIONS] : [])
    }, [])

    // 개별 상태 체크 - 1개만 선택해도 '전체'는 자동 해제됨 (isAllStatusSelected로 판별)
    const handleStatusChange = useCallback((status, checked) => {
        setStatusFilters((prev) => {
            if (checked) {
                return prev.includes(status) ? prev : [...prev, status]
            }
            return prev.filter((s) => s !== status)
        })
    }, [])

    // 검색 버튼 - 입력값을 applied*에 반영. 편집 중이면 alert 후 중단
    const handleSearch = useCallback(() => {
        if (blockSearchInEditMode()) return
        setAppliedKeyword(searchKeyword)
        setAppliedStatuses([...statusFilters])
        setCurrentPage(1)
    }, [blockSearchInEditMode, searchKeyword, statusFilters])

    // 검색 초기화 버튼 - 편집 중이면 alert 후 중단
    const handleSearchReset = useCallback(() => {
        if (blockSearchInEditMode()) return
        resetSearchConditions()
    }, [blockSearchInEditMode, resetSearchConditions])

    // 전체 확정 데이터를 엑셀 파일로 다운로드 (검색 조건 제외)
    const handleExcelDownload = useCallback(() => {
        exportEmployeesExcel(excelExportData)
    }, [excelExportData])

    // 셀 값 변경 → draftData(임시)만 수정. 반려 선택 시 reason '-' 제거, 그 외 status는 reason '-'
    const handleCellEdit = useCallback((id, field, value) => {
        setDraftData((prev) => {
            if (!prev) return prev
            const next = prev.map((row) => {
                if (row.id !== id) return row
                const updated = { ...row, [field]: value }
                if (field === 'status') {
                    if (value === '반려') {
                        if (!updated.reason || updated.reason === '-') {
                            updated.reason = ''
                        }
                    } else {
                        updated.reason = '-'
                    }
                }
                return updated
            })
            draftDataRef.current = next
            return next
        })
    }, [])

    // 편집 시작: allData 전체 복사(draft) + 현재 검색 결과 행 id만 스냅샷 (화면은 검색 결과와 동일)
    const handleEditStart = useCallback(() => {
        const draft = allData.map((row) => ({ ...row }))
        draftDataRef.current = draft

        const matchedRows = filterEmployees(allData, {
            keyword: appliedKeyword,
            statuses: appliedStatuses,
        })
        setEditRowIds(matchedRows.map((row) => row.id))

        setDraftData(draft)
        setIsEditing(true)
    }, [allData, appliedKeyword, appliedStatuses])

    // 저장: 반려 사유 검증 → 확인 confirm → draft 전체를 allData에 확정 → 검색 조건 초기화
    const handleSave = useCallback(() => {
        gridControlRef.current?.stopEditing(false)

        const data = draftDataRef.current
        if (data == null) return

        if (hasMissingRejectReason(data)) {
            alert(REJECT_REASON_REQUIRED_MSG)

            const invalidId = findFirstMissingRejectReasonId(data)
            if (invalidId != null) {
                const rowIndexInSorted = sortedData.findIndex((r) => r.id === invalidId)
                if (rowIndexInSorted >= 0) {
                    const targetPage = Math.floor(rowIndexInSorted / pageSize) + 1
                    if (targetPage !== currentPage) {
                        setCurrentPage(targetPage)
                    }
                }
                gridControlRef.current?.scheduleReasonFocus?.(invalidId)
            }
            return
        }

        if (!window.confirm(SAVE_CONFIRM_MSG)) {
            return
        }

        editExitCancelRef.current = false
        setAllData(data)
        setDraftData(null)
        draftDataRef.current = null
        setEditRowIds(null)
        setIsEditing(false)
        resetSearchConditions()
    }, [sortedData, currentPage, pageSize, resetSearchConditions])

    // 취소: 셀 편집 버림 + draft 폐기 → allData 복귀 (검색 조건·editRowIds 유지)
    const handleCancel = useCallback(() => {
        editExitCancelRef.current = true
        gridControlRef.current?.stopEditing(true)
        setDraftData(null)
        draftDataRef.current = null
        setEditRowIds(null)
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
                <li>검색 조건 (이름·사용처·사유 + 상태 체크박스, SearchPanel / filterEmployees)</li>
                <li>검색 버튼 클릭 시 applied 조건 반영 (입력값·적용값 분리)</li>
                <li>편집 진입 시 검색 결과 id 스냅샷 (editRowIds — 상태 변경해도 목록 유지)</li>
                <li>편집 중 검색·초기화 차단 alert / 저장 시 검색 조건 초기화</li>
                <li>편집 모드 Draft 패턴 (draftData / allData, 편집·저장·취소)</li>
                <li>상태 커스텀 뱃지 드롭다운 (StatusCellEditor / StatusCellEditRenderer)</li>
                <li>반려 시 사유 입력 (ReasonCellEditor, placeholder, 반려 선택 후 자동 focus)</li>
                <li>저장 시 반려 사유 필수 검증 alert + 저장 confirm</li>
                <li>검증 실패 시 해당 사유 셀 focus 이동 (scheduleReasonFocus)</li>
                <li>엑셀 다운로드 (exportEmployeesExcel, 검색 조건 제외 전체 데이터)</li>
                <li>데이터 없음 오버레이 (localeText — 조회된 데이터가 없습니다.)</li>
            </ul>
            <SearchPanel onSearch={handleSearch} onReset={handleSearchReset}>
                <SearchPanel.Field label="검색어">
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch()
                        }}
                        placeholder="이름, 사용처, 사유를 입력해주세요."
                    />
                </SearchPanel.Field>
                <SearchPanel.Field label="상태">
                    <ul className={searchStyles.statusChk}>
                        <li>
                            <label className="commChk">
                                <input
                                    type="checkbox"
                                    checked={isAllStatusSelected}
                                    onChange={(e) => handleAllStatusChange(e.target.checked)}
                                />
                                전체
                            </label>
                        </li>
                        {STATUS_OPTIONS.map((status) => (
                            <li key={status}>
                                <label className="commChk">
                                    <input
                                        type="checkbox"
                                        checked={statusFilters.includes(status)}
                                        onChange={(e) =>
                                            handleStatusChange(status, e.target.checked)
                                        }
                                    />
                                    {status}
                                </label>
                            </li>
                        ))}
                    </ul>
                </SearchPanel.Field>
            </SearchPanel>
            <GridInfo totalCount={dataRowCount}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                    setPageSize(size)       // 페이지당 행 수 변경
                    setCurrentPage(1)       // 1페이지로 초기화
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
