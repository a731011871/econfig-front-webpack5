import React from 'react';
import { ModalContent, ModalHeader, ModalClose, ModalCustomHeader } from './modal.styled';

export default class ModalWrapper extends React.PureComponent {

    render() {
        const { children, title, display, onClose, customButtons, ...restProps } = this.props;
        return (
            <ModalContent 
                {...restProps}
                title={title}
                customButtons={customButtons}
                display={display}
            >
                {
                    title && (
                        <React.Fragment>
                            <ModalHeader>{title}</ModalHeader>
                            <ModalClose onClick={onClose}>✕</ModalClose>
                        </React.Fragment>
                    )
                }
                {
                    customButtons && (<ModalCustomHeader>{customButtons}</ModalCustomHeader>)
                }
                {children}
            </ModalContent>
        );
    }
}
