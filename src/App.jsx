import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Project from './components/Project.jsx'
import Platform from './components/Platform.jsx'
import Architecture from './components/Architecture.jsx'
import Skills from './components/Skills.jsx'
import ModelCard from './components/ModelCard.jsx'
import Agents from './components/Agents.jsx'
import Rag from './components/Rag.jsx'
import Console from './components/Console.jsx'
import Evaluation from './components/Evaluation.jsx'
import Credentials from './components/Credentials.jsx'
import TechStack from './components/TechStack.jsx'
import Security from './components/Security.jsx'
import Deploy from './components/Deploy.jsx'
import Limits from './components/Limits.jsx'
import Roadmap from './components/Roadmap.jsx'
import Faq from './components/Faq.jsx'
import Contact from './components/Contact.jsx'
import Brain3D from './components/Brain3D.jsx'
import Reports from './components/Reports.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <main className="bg-ink">
      <ScrollProgress />
      <Header />
      <Hero />
      <Project />
      <Platform />
      <Architecture />
      <Brain3D />
      <Agents />
      <Rag />
      <Console />
      <Evaluation />
      <ModelCard />
      <Credentials />
      <Skills />
      <Reports />
      <TechStack />
      <Security />
      <Deploy />
      <Limits />
      <Roadmap />
      <Faq />
      <Contact />
      <Footer />
    </main>
  )
}
