import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
function App() {
    return (
        <BrowserRouter>
            <Header />
            <Login/>
            <AppRoutes />
            <Footer />
        </BrowserRouter>
    );
}

export default App;
