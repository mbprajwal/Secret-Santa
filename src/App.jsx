import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import ShareLinks from './pages/ShareLinks';
import Reveal from './pages/Reveal';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<CreateGroup />} />
                    <Route path="/share" element={<ShareLinks />} />
                    <Route path="/reveal/:id" element={<Reveal />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
