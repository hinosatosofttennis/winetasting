import React from 'react';
import styled from 'styled-components';
import { APP_NAME } from '../utils/constants'; // アプリ名をインポート

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;
const ModalContent = styled.div`
    background: white;
    padding: 25px;
    border-radius: 10px;
    width: 80%;
    max-width: 400px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const CustomAlert = ({ message, type, onClose }) => {
    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                {/* 【✅ アプリ名を表示】ブラウザドメイン名と置き換え */}
                <h3 style={{ marginTop: 0, color: type === 'success' ? '#28a745' : '#dc3545' }}>
                    {APP_NAME}
                </h3>
                <p>{message}</p>
                <button 
                    onClick={onClose} 
                    style={{ float: 'right', padding: '8px 15px', backgroundColor: '#007bff', color: 'white' }}
                >
                    OK
                </button>
            </ModalContent>
        </ModalOverlay>
    );
};

export default CustomAlert;
