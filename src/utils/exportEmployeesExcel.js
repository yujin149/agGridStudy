import ExcelJS from 'exceljs'

const HEADERS = ['부서', '이름', '사용처', '금액', '상태', '사유']

const COL = {
    DEPARTMENT: 1,
    NAME: 2,
    USAGE: 3,
    AMOUNT: 4,
    STATUS: 5,
    REASON: 6,
}

const COLORS = {
    blueBg: 'FFDBEAFE',
    grayBg: 'FFF8FAFC',
    grayBg2: 'FFe2e8f0',
    border: 'FF7F7F7F',
    textSecondary: 'FF404040',
    textPrimary: 'FF000000',
    success500: 'FF019E21',
    danger500: 'FFff0000',
    white: 'FFFFFFFF',
}

const FONT = {
    family: '맑은 고딕',      // PC에 없는 폰트면 엑셀이 대체 폰트 사용
    size: 10,               // 데이터 셀 글자 크기 (pt)
    headerSize: 10,         // 헤더 행 글자 크기 (pt)
}

// thinBorderSide: 얇은 테두리 한 변의 스타일
function thinBorderSide() {
    return { style: 'thin', color: { argb: COLORS.border } }
}

// setBorder: 셀 4면 테두리 적용 (모든 변 동일한 얇은 선)
function setBorder(cell) {
    cell.border = {
        top: thinBorderSide(),
        left: thinBorderSide(),
        bottom: thinBorderSide(),
        right: thinBorderSide(),
    }
}

// solidFill: 셀 배경색 (단색)
function solidFill(argb) {
    return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

// sanitizeSheetName: 엑셀 탭 이름 규칙 (31자, 특수문자 제거)
function sanitizeSheetName(name) {
    const cleaned = String(name).replace(/[\\/?*[\]:]/g, '').trim()
    return cleaned.slice(0, 31) || 'Sheet'
}

// groupByDepartment: sortedData를 부서별로 묶음 → 탭 1개 = 부서 1개
// 반환: [{ dept: '개발팀', rows: [...] }, ...]
// rows 안 순서 = 그리드 2차 정렬 순서 + 맨 아래 합계 행(isSummary)
function groupByDepartment(sortedData) {
    const order = []
    const map = new Map()

    for (const row of sortedData) {
        const dept = row.department
        if (!map.has(dept)) {
            map.set(dept, [])
            order.push(dept)
        }
        map.get(dept).push(row)
    }

    return order.map((dept) => ({ dept, rows: map.get(dept) }))
}

// formatAmount: 금액 표시 형식 (그리드 valueFormatter와 동일하게 '120,000원')
function formatAmount(value) {
    return value != null ? `${value.toLocaleString()}원` : '-'
}

// getRowValues: 엑셀 한 행에 들어갈 값 배열 (HEADERS 순서와 동일)
// rowIndex === 0 일 때만 부서명 표시 → 나머지는 빈칸 (세로 병합용)
function getRowValues(row, rowIndex) {
    if (row.isSummary) {
        // 합계 행 - employeeColDefs.js의 valueGetter / colSpan 규칙과 맞춤
        return [
            rowIndex === 0 ? row.department : '', // 부서 (병합 시 첫 행만)
            row.name,                             // '합계'
            formatAmount(row.amount),             // 사용처 칸에 합계 금액 (병합 후 표시)
            '',                                   // 금액 칸 (사용처와 가로 병합)
            row.status,                           // '승인건 합계'
            row.reason ?? '',                     // 승인완료 금액 텍스트
        ]
    }

    // 일반 데이터 행
    return [
        rowIndex === 0 ? row.department : '',
        row.name,
        row.usage ?? '',
        formatAmount(row.amount),
        row.status,
        row.reason ?? '',
    ]
}

// setAlignment: 셀 정렬 (horizontal: 'left' | 'center' | 'right')
function setAlignment(cell, horizontal) {
    cell.alignment = { horizontal, vertical: 'middle' }
}

// setFont: 글꼴·크기·굵기·색
function setFont(cell, { bold = false, color = COLORS.textSecondary, size = FONT.size } = {}) {
    cell.font = {
        name: FONT.family,
        size,
        bold,
        color: { argb: color },
    }
}

// setFill: 셀 배경색
function setFill(cell, color) {
    cell.fill = solidFill(color)
}

// applyStatusStyle: 상태(E열) 셀만
function applyStatusStyle(cell, status) {
    if (status === '승인완료') {
        setFill(cell)
        setFont(cell, { color: COLORS.success500 })
    } else if (status === '승인대기') {
        setFill(cell)
        setFont(cell, { color: COLORS.textSecondary })
    } else if (status === '반려') {
        setFill(cell)
        setFont(cell, { color: COLORS.danger500 })
    } else if (status === '승인건 합계') {
        setFill(cell, COLORS.grayBg2)
        setFont(cell, { bold: true, color: COLORS.textPrimary })
    }
}

// styleHeaderRow: 1행(컬럼 제목)
function styleHeaderRow(row) {
    row.height = 24 // 행 높이 (pt).
    row.eachCell((cell) => {
        setFill(cell, COLORS.blueBg)
        setFont(cell, { bold: true, color: COLORS.textPrimary, size: FONT.headerSize })
        setAlignment(cell, 'center')
    })
}

// styleDataRow: 2행~(데이터·합계) - 열마다 다른 스타일 적용
// colNumber === COL.XXX 로 "어느 열인지" 분기
function styleDataRow(row, rowData) {
    row.height = 24

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        setAlignment(cell, 'center')
        setFont(cell)

        if (rowData.isSummary) {
            // 합계 행 — 라벨(합계·승인건 합계): grayBg2 / 금액: grayBg
            setFill(cell, COLORS.grayBg2)
            setFont(cell, { bold: true, color: COLORS.textPrimary })

            if (colNumber === COL.USAGE || colNumber === COL.AMOUNT || colNumber === COL.REASON) {
                setFill(cell, COLORS.grayBg)
            }

            if (colNumber === COL.USAGE || colNumber === COL.AMOUNT) {
                setAlignment(cell, 'right') // summary-amount-cell
            }

            if (colNumber === COL.REASON) {
                setAlignment(cell, 'right') // summary-reason-cell
            }

            if (colNumber === COL.STATUS) {
                applyStatusStyle(cell, rowData.status)
            }

            return
        }

        // 일반 데이터 행
        if (colNumber === COL.DEPARTMENT) {
            setFill(cell, COLORS.blueBg) // cell-dept
            setFont(cell, { bold: true, color: COLORS.textPrimary })
        }

        if (colNumber === COL.AMOUNT) {
            setAlignment(cell, 'right') // cell-amount
            setFont(cell, { color: COLORS.textPrimary })
        }

        if (colNumber === COL.STATUS) {
            applyStatusStyle(cell, rowData.status)
        }
    })
}

// applyDepartmentMerge: A열(부서) 세로 병합
// firstDataRow=2 → 1행은 헤더, 2행부터 데이터
function applyDepartmentMerge(worksheet, rowCount) {
    const firstDataRow = 2
    const lastDataRow = rowCount + 1

    if (lastDataRow <= firstDataRow) return

    worksheet.mergeCells(firstDataRow, COL.DEPARTMENT, lastDataRow, COL.DEPARTMENT)

    for (let rowIndex = firstDataRow; rowIndex <= lastDataRow; rowIndex += 1) {
        const cell = worksheet.getCell(rowIndex, COL.DEPARTMENT)
        setFill(cell, COLORS.blueBg)
        setFont(cell, { bold: true, color: COLORS.textPrimary })
        setAlignment(cell, 'center')
    }
}

// applySummaryMerge: 합계 행 C~D열(사용처+금액) 가로 병합
function applySummaryMerge(worksheet, summaryRowIndex) {
    if (summaryRowIndex < 0) return

    const excelRow = summaryRowIndex + 2 // rows 배열 인덱스 → 엑셀 행 번호 (+ 헤더 1행)
    worksheet.mergeCells(excelRow, COL.USAGE, excelRow, COL.AMOUNT)

    const usageCell = worksheet.getCell(excelRow, COL.USAGE)
    setFill(usageCell, COLORS.grayBg)
    setFont(usageCell, { bold: true, color: COLORS.textPrimary })
    setAlignment(usageCell, 'right')
}

// applyTableBorders: 병합·스타일 적용 후 전체 표에 테두리 (마지막에 호출)
function applyTableBorders(worksheet, rowCount) {
    const totalRows = rowCount + 1 // 헤더 1 + 데이터 rowCount
    const totalCols = HEADERS.length

    for (let rowIndex = 1; rowIndex <= totalRows; rowIndex += 1) {
        for (let colIndex = 1; colIndex <= totalCols; colIndex += 1) {
            setBorder(worksheet.getCell(rowIndex, colIndex))
        }
    }
}

// buildWorksheet: 부서 탭 1개 분량 (헤더 + 데이터 + 병합 + 테두리)
function buildWorksheet(workbook, sheetName, rows) {
    const worksheet = workbook.addWorksheet(sheetName) // 탭 이름 = 부서명

    // 열 너비
    worksheet.columns = [
        { width: 12 }, // 부서
        { width: 10 }, // 이름
        { width: 14 }, // 사용처
        { width: 14 }, // 금액
        { width: 14 }, // 상태
        { width: 28 }, // 사유
    ]

    const headerRow = worksheet.addRow(HEADERS)
    styleHeaderRow(headerRow)

    rows.forEach((rowData, index) => {
        const dataRow = worksheet.addRow(getRowValues(rowData, index))
        styleDataRow(dataRow, rowData)
    })

    applyDepartmentMerge(worksheet, rows.length)

    const summaryIndex = rows.findIndex((row) => row.isSummary)
    applySummaryMerge(worksheet, summaryIndex)
    applyTableBorders(worksheet, rows.length)

    return worksheet
}

// downloadWorkbook: 엑셀 바이너리 → Blob → <a> 클릭으로 저장
function downloadWorkbook(workbook, fileName) {
    return workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        URL.revokeObjectURL(url)
    })
}

/** 정렬·합계 행 포함 sortedData를 엑셀(.xlsx) 파일로 다운로드 */
export function exportEmployeesExcel(sortedData, fileName = '경비내역.xlsx') {
    const groups = groupByDepartment(sortedData)
    const workbook = new ExcelJS.Workbook()
    const usedSheetNames = new Set()

    for (const { dept, rows } of groups) {
        let sheetName = sanitizeSheetName(dept)
        let suffix = 1

        // 탭 이름 중복 방지 (같은 부서명이 2번 나오면 '개발팀_1' 등)
        while (usedSheetNames.has(sheetName)) {
            sheetName = sanitizeSheetName(`${dept}_${suffix}`)
            suffix += 1
        }
        usedSheetNames.add(sheetName)

        buildWorksheet(workbook, sheetName, rows)
    }

    return downloadWorkbook(workbook, fileName)
}
