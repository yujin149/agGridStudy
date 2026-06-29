/** 상태 열 - 옵션 목록·뱃지 class 공통 설정 (Renderer / Editor 공유) */
export const STATUS_OPTIONS = ['승인대기', '승인완료', '반려']

/** 상태 값 → CSS class (BasicGrid.module.css의 .status-* 와 연결) */
export const STATUS_CLASS_MAP = {
    승인완료: 'status-done',
    승인대기: 'status-pending',
    반려: 'status-rejected',
}
