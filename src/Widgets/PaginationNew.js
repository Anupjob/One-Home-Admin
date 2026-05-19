import React from 'react'

const PaginationNew = ({perPage, totalItems, currentPage, handler}) => {
    let totalPage = Math.ceil(totalItems / perPage);
    let pageList = [];
    for (let i = 1; i <= totalPage; i++) {
        pageList.push(i);
    }

    const getPageNumbers = () => {
        let pageNumbers = [];

        if (totalPage <= 5) {
            pageNumbers = pageList;
        } else {
            if (currentPage <= 5) {
                pageNumbers = [1, 2, 3, 4, 5, '...', totalPage];
            } else if (currentPage >= totalPage - 5) {
                pageNumbers = [1, '...', totalPage - 3, totalPage - 2, totalPage - 1, totalPage];
            } else {
                pageNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPage];
            }
        }

        return pageNumbers;
    };

    return (
        <>
            {totalPage > 1 && (
                <nav>
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                href="#"
                                tabIndex="-1"
                                onClick={() => handler(currentPage - 1)}
                                aria-label="Previous"
                            >
                                Prev
                            </button>
                        </li>

                        {getPageNumbers().map((item, index) => (
                            <li
                                key={index}
                                className={`page-item ${currentPage === item ? 'active' : ''}`}
                                style={{margin: '0 5px'}}
                            >
                                {typeof item === 'number' ? (
                                    <button className="page-link" onClick={() => handler(item)}>
                                        {item}
                                    </button>
                                ) : (
                                    <span>{item}</span>
                                )}
                            </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPage ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                href="#"
                                onClick={() => handler(currentPage + 1)}
                                aria-label="Next"
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </>
    );
};


export default PaginationNew
