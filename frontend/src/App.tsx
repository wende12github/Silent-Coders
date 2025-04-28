import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
    return (
        <BrowserRouter>
            <Header />
            <AppRoutes />
            <Footer />
        </BrowserRouter>
    );
}

export default App;
