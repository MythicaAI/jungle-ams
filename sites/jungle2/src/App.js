import logo from './logo.svg';
//import './App.css';
import './index.css'
import { MainPageUpload } from './components/upload'
import { AppMenubar } from "./components/menubar";
import { MainPageAssetCollection } from "./components/assetcollection";
import {useRef} from "react";

function App() {
    return (
        <div className="App">
            <AppMenubar/>
            <section>
                <MainPageUpload />
            </section>
            <section>
                <MainPageAssetCollection />
            </section>
        </div>
    );
}

export default App;
