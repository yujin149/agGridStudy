import { forwardRef, useImperativeHandle, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz } from 'ag-grid-community'
import styles from './BasicGrid.module.css'

/**
 * AG Grid 공통 틀 — 테마·wrapper·AgGridReact만 담당
 * 컬럼/정렬/병합/편집 등 표마다 다른 설정은 props로 받음
 */
const gridTheme = themeQuartz.withParams({
    headerBackgroundColor: 'var(--primary-color-50)',
    headerTextColor: 'var(--gray-color-700)',
    backgroundColor: 'var(--card-background-color)',
    borderColor: 'var(--border-color)',
    foregroundColor: 'var(--text-primary-color)',
    rowBorder: true,
    headerRowBorder: {
        width: 3,
        style: 'solid',
        color: 'var(--border-color)',
    },
    columnBorder: true,
    pinnedColumnBorder: {
        width: 3,
        style: 'solid',
        color: 'var(--border-color)',
    },
    fontFamily: 'var(--font-family)',
    fontSize: 14,
    headerFontSize: 14,
    headerFontWeight: 600,
    spacing: 8,
    wrapperBorder: true,
    wrapperBorderRadius: 0,
})

const BasicGrid = forwardRef(function BasicGrid(
    {
        rowData,
        columnDefs,
        defaultColDef: defaultColDefProp,
        height = 400,
        enableCellSpan = false,
        postSortRows,
        getRowClass,
        getRowId,
        onSortChanged,
        onCellValueChanged,
        onCellMouseDown, // 셀 mousedown (상태 드롭다운 재클릭 닫기용)
        onCellClicked, // 셀 click (상태 드롭다운 재클릭 닫기용)
        stopEditingWhenCellsLoseFocus = false, // true: 포커스 이탈 시 편집 종료
    },
    ref,
) {
    const gridRef = useRef(null)

    useImperativeHandle(ref, () => gridRef.current)

    return (
        <div style={{ height, width: '100%' }} className={styles.gridWrap}>
            <AgGridReact
                ref={gridRef}
                theme={gridTheme}
                rowData={rowData}
                columnDefs={columnDefs}
                getRowId={getRowId}
                defaultColDef={{
                    suppressMovable: true,
                    ...defaultColDefProp,
                }}
                enableCellSpan={enableCellSpan}
                getRowClass={getRowClass}
                postSortRows={postSortRows}
                onSortChanged={onSortChanged}
                onCellValueChanged={onCellValueChanged}
                onCellMouseDown={onCellMouseDown}
                onCellClicked={onCellClicked}
                stopEditingWhenCellsLoseFocus={stopEditingWhenCellsLoseFocus}
            />
        </div>
    )
})

export default BasicGrid
