import dayjs from 'dayjs'

const BORROW_DAY_LIMIT = {
  นักเรียน: {
    หนังสือ: 7,
    ซีดี: 7,
    หนังสือจอง: 3,
  },
  ครู: {
    หนังสือ: 30,
    ซีดี: 30,
    หนังสือจอง: 3,
  },
  เจ้าหน้าที่: {
    หนังสือ: 7,
    ซีดี: 7,
    หนังสือจอง: 3,
  },
  บุคคลภายนอก: {
    หนังสือ: 7,
    ซีดี: 7,
    หนังสือจอง: 3,
  },
}

/**
 *
 * @param {string} job User's Job
 * @param {string} type Book's Type
 */
export function getLimitDate(job, type) {
  const limitDay = BORROW_DAY_LIMIT[job][type]
  return dayjs().add(limitDay, 'day').toDate()
}
