//import './App.css';
import './index.css'
import { AssetUpload } from './components/AssetUpload'
import { AppMenubar } from "./components/AppMenubar";
import { AssetCollection } from "./components/AssetCollection";
import {useRef} from "react";

function App() {
    return (
        <div className="App">
            <AppMenubar/>
            <section>
                <AssetUpload progress={0}/>
            </section>
            <section>
                <AssetCollection />
            </section>
        </div>
    );
}

export default App;
