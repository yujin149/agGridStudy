import { useState } from 'react'
import BasicGrid from '../components/Grid/BasicGrid.jsx'
import Pagination from '../components/Pagination/Pagination.jsx'
import styles from './GridPage.module.css'

function GridPage() {
    // 페이징
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = 10 //임의 고정값
    return (
        <div>
            <BasicGrid/>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}

export default GridPage