import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
// src/main.jsx or App.jsx
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

library.add(fas, far, fab) // Add all icons or specific ones
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
    return (
        <BrowserRouter>
            {/* <Header /> */}
            <AppRoutes />
            {/* <Footer /> */}
        </BrowserRouter>
    );
}

export default App;
