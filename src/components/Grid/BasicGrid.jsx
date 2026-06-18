import { useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import rowDataJson from '../../data/rowData.json'
/**
 * initialColDefs : colDefs.js에서 가져온 시작용 데이터 → useState에 한 번만 넣는 초기 값
 * 열 정의를 나중에 바꿀 계획이 없다면 useState도 없이 import만 써도 된다.
 **/
import { colDefs as initialColDefs } from '../../data/colDefs.js'

function BasicGrid() {
    const [rowData] = useState(rowDataJson)

    const [colDefs] = useState(initialColDefs)

    return (
        <div style={{ height: 400, width: '100%' }}>
            <AgGridReact rowData={rowData} columnDefs={colDefs} />
        </div>
    )
}

export default BasicGrid
