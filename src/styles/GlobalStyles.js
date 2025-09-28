import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: #f4f4f9;
  }
  
  h2 {
    color: #333;
    border-bottom: 2px solid #ccc;
    padding-bottom: 5px;
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: 8px;
    padding: 10px 15px;
    font-size: 16px;
    transition: background-color 0.2s;
  }
  
  .accordion-panel {
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
  }

  /* モバイルでのタッチ領域を広くするためのスタイル例 */
  .selection-button {
    display: inline-block;
    padding: 12px 10px;
    margin: 4px;
    border: 1px solid #007bff;
    background: white;
    color: #007bff;
    text-align: center;
    border-radius: 5px;
  }
  .selection-button.selected {
    background: #007bff;
    color: white;
  }
`;

export default GlobalStyle;
