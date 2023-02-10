import React, { useRef, ReactElement } from "react";

interface ModalPropsType {
    className?: string,
    headerClassName?: string,
    hideTitle?: boolean,
    open?: boolean,
    title?: string | ReactElement,
    children: string | ReactElement,
    onClose: () => void,
}
export default function Modal({
    className = "",
    headerClassName = "",
    hideTitle = false,
    open = false,
    title = "",
    children,
    onClose,
}: ModalPropsType) {
    const bckRef = useRef(null);

    return (
        <>
            {
                !open ? null :
                    <div
                        className="sa-fixed sa-top-0 sa-left-0 sa-bg-black sa-bg-opacity-20 sa-z-50 sa-w-screen sa-h-screen sa-flex sa-items-center sa-justify-center"
                        ref={bckRef}
                        onClick={(e) => { if (e.target === bckRef.current) onClose(); }}
                    >
                        <div className={`sa-bg-white sa-rounded-xl sa-max-w-[1088px] sa-max-h-[calc(100vh-200px)] sa-min-w-[250px] sa-min-h-[150px] sa-overflow-y-auto ${className}`}>
                            {
                                hideTitle ? null :
                                    <div className={`sa-sticky sa-top-0  sa-bg-white sa-flex sa-items-center sa-justify-between sa-p-5 sa-shadow ${headerClassName}`}>
                                        <div>{title}</div>
                                        <div
                                            className={`sa-w-8 sa-h-8 sa-flex sa-items-center sa-justify-center sa-bg-gray-200 sa-rounded-full sa-cursor-pointer`}
                                            onClick={onClose}
                                        >
                                            X
                                        </div>
                                    </div>
                            }

                            <div>{children}</div>
                        </div>
                    </div>
            }
        </>
    )
}