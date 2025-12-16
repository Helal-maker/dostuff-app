import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import Footer from '@/components/Footer';
import LegalSidebar from '@/components/legal/LegalSidebar';
import { lazy, Suspense } from 'react';

const BackgroundScene = lazy(() => import('@/components/three/BackgroundScene'));

const chapters = [
  { id: 'definitions', title: '1. Definitions and Scope' },
  { id: 'collection', title: '2. Collection and Use' },
  { id: 'legal-bases', title: '3. Legal Bases' },
  { id: 'purposes', title: '4. Purposes of Processing' },
  { id: 'processing', title: '5. Data Processing' },
  { id: 'transfers', title: '6. International Transfers' },
  { id: 'retention', title: '7. Data Retention' },
  { id: 'cookies', title: '8. Cookies' },
  { id: 'security', title: '9. Security' },
  { id: 'updates', title: '10. Updates' },
  { id: 'contact', title: '11. Contact' },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <BackgroundScene variant="legal" />
      </Suspense>
      
      <ResponsiveNavbar />
      <main className="pt-24 pb-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            <LegalSidebar chapters={chapters} />
            
            <div className="flex-1 max-w-3xl">
              <article className="glass rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">Oryno Privacy Policy</h1>
                <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">Last Updated: December 2025</p>

                <div className="space-y-6 md:space-y-8 text-foreground/90">
                  <p className="text-muted-foreground text-sm md:text-base">
                    Oryno LLC. ("Oryno," "we," "us," or "our") is a technology provider dedicated to empowering users to ideate, build, and manage projects through our suite of digital tools, including IdeaHub, PhotoMap, Do Stuff. Our mission is to simplify the transition from concept to execution through innovative software solutions, while maintaining the strictest standards of data integrity. We are committed to ensuring compliance with applicable privacy laws in the jurisdictions where we operate, including the United States, the European Economic Area (EEA), and the United Kingdom.
                  </p>
                  <p className="text-muted-foreground text-sm md:text-base">
                    This Privacy Policy ("Policy") outlines how Oryno collects, uses, shares, and protects the data of our users ("User," "you," or "your") across our website (oryno-co.pages.dev), applications, and related services (collectively, the "Services"). By accessing our Services, you acknowledge the practices described in this Policy. This Policy incorporates our Terms of Service by reference. In the event of a conflict between this Policy and a specific Data Processing Agreement (DPA) signed between you and Oryno, the DPA shall prevail regarding the processing of Customer Data.
                  </p>

                  <section id="definitions">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">1. Definitions and Scope</h2>
                    <p className="text-muted-foreground text-sm md:text-base mb-3">
                      <strong className="text-foreground">Personal Data:</strong> For the purposes of this Policy, "Personal Data" refers to any information that relates to an identified or identifiable natural person. This includes direct identifiers (such as names and email addresses) and technical identifiers (such as IP addresses, unique device tokens, and authentication logs).
                    </p>
                    <p className="text-muted-foreground text-sm md:text-base">
                      <strong className="text-foreground">Service Data:</strong> Metrics, telemetry, and aggregated usage statistics that Oryno processes independently for security, billing, resource optimization, and product analytics. Service Data is distinct from Customer Personal Data and is owned by Oryno.
                    </p>
                  </section>

                  <section id="collection">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">2. Collection and Use of Information</h2>
                    <p className="text-muted-foreground mb-4 text-sm md:text-base">We collect data to ensure the functionality, security, and improvement of our Services.</p>
                    
                    <h3 className="text-lg font-medium text-foreground mb-2">2.1 Information You Provide Directly</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 text-sm md:text-base">
                      <li><strong className="text-foreground">Account & Identity:</strong> When you register for one of Oryno services, you provide identifiers such as your name, business email, and secure credentials.</li>
                      <li><strong className="text-foreground">Billing Information:</strong> We utilize third-party payment processors (e.g., Stripe) to handle transactions. Oryno does not store full credit card details on its servers. We retain only the necessary billing tokens and transaction history required for invoicing and tax compliance.</li>
                      <li><strong className="text-foreground">User Content & Inputs:</strong> Data you input into the Service, including project descriptions, text prompts, and uploaded files ("Content"), is processed solely to provide the Service to you.</li>
                    </ul>

                    <h3 className="text-lg font-medium text-foreground mb-2">2.2 Information Collected Automatically</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4 text-sm md:text-base">
                      <li><strong className="text-foreground">Telemetry & Logs:</strong> We automatically record technical data regarding your interaction with the Services, including API response times, feature usage, page loads, and error logs.</li>
                      <li><strong className="text-foreground">Device Fingerprinting:</strong> We collect IP addresses, browser types, operating system versions, and device identifiers to prevent fraud and ensure session security.</li>
                    </ul>

                    <h3 className="text-lg font-medium text-foreground mb-2">2.3 Third-Party Integrations</h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      If you utilize third-party integrations (e.g., social login via Google or GitHub), we access only the minimum data required to authenticate your identity and provision your account.
                    </p>
                  </section>

                  <section id="legal-bases">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">3. Legal Bases for Processing</h2>
                    <p className="text-muted-foreground mb-3 text-sm md:text-base">Oryno processes Personal Data only where a valid legal ground applies:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm md:text-base">
                      <li><strong className="text-foreground">Performance of a Contract:</strong> To provide the SaaS features, hosting, and functionality you have subscribed to.</li>
                      <li><strong className="text-foreground">Legitimate Interests:</strong> To secure the platform, detect abuse, debug technical issues, and analyze aggregate trends to improve our product roadmap.</li>
                      <li><strong className="text-foreground">Legal Obligations:</strong> To comply with financial reporting, tax laws, and export control regulations.</li>
                      <li><strong className="text-foreground">Consent:</strong> For specific, non-essential tracking or optional marketing communications, where applicable.</li>
                    </ul>
                  </section>

                  <section id="purposes">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">4. Purposes of Processing</h2>
                    <p className="text-muted-foreground mb-3 text-sm md:text-base">We utilize collected information for the following business and commercial objectives:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm md:text-base">
                      <li><strong className="text-foreground">Service Delivery:</strong> Provisioning account access, hosting user content, and executing software commands.</li>
                      <li><strong className="text-foreground">Security & Integrity:</strong> Monitoring for suspicious activity, enforcing API rate limits, and preventing unauthorized access.</li>
                      <li><strong className="text-foreground">Product Evolution:</strong> Analyzing user workflows on an aggregated basis to refine features and optimize UI/UX.</li>
                      <li><strong className="text-foreground">Transactional Communication:</strong> Sending invoices, downtime alerts, and critical security notices.</li>
                    </ul>
                  </section>

                  <section id="processing">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">5. Data Processing and Infrastructure</h2>
                    <p className="text-muted-foreground mb-3 text-sm md:text-base">
                      Oryno acts as a Data Controller for account information and a Data Processor for the content you create within our tools. We engage trusted third-party sub-processors to support our infrastructure, including:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm md:text-base">
                      <li><strong className="text-foreground">Cloud Hosting:</strong> Tier-1 cloud providers for database storage and computing power.</li>
                      <li><strong className="text-foreground">AI & Processing:</strong> If applicable, we may utilize third-party APIs (e.g., OpenAI, Anthropic) to process specific user prompts. These providers process data on a pass-through basis and do not retain your data for model training unless explicitly stated.</li>
                    </ul>
                  </section>

                  <section id="transfers">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">6. International Data Transfers</h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                      Oryno operates globally. Data may be transferred to, stored, and processed in the United States or other jurisdictions where our sub-processors operate. We ensure that such transfers are protected through appropriate legal mechanisms, such as Standard Contractual Clauses (SCCs) or adequacy decisions where applicable.
                    </p>
                  </section>

                  <section id="retention">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">7. Data Retention</h2>
                    <p className="text-muted-foreground mb-3 text-sm md:text-base">We retain Personal Data only for as long as necessary to fulfill the purposes outlined in this Policy, or as required by law.</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm md:text-base">
                      <li><strong className="text-foreground">Active Accounts:</strong> Data is retained for the duration of your subscription.</li>
                      <li><strong className="text-foreground">Deleted Accounts:</strong> Upon account termination, data acts are queued for deletion or anonymization within 90 days, retaining only what is necessary for tax and legal records.</li>
                      <li><strong className="text-foreground">Log Data:</strong> Technical logs are retained for a rolling period (typically up to 90 days) for security auditing.</li>
                    </ul>
                  </section>

                  <section id="cookies">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">8. Cookies and Tracking Technologies</h2>
                    <p className="text-muted-foreground mb-3 text-sm md:text-base">We use cookies to operate and secure our Services.</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm md:text-base">
                      <li><strong className="text-foreground">Strictly Necessary Cookies:</strong> Essential for authentication and load balancing. These cannot be disabled.</li>
                      <li><strong className="text-foreground">Performance Cookies:</strong> Help us understand latency and usage patterns.</li>
                      <li><strong className="text-foreground">Functional Cookies:</strong> Store your UI preferences (e.g., dark mode).</li>
                    </ul>
                  </section>

                  <section id="security">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">9. Security and Liability</h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                      We implement industry-standard encryption (TLS 1.2+) for data in transit and at rest. However, no internet transmission is completely secure. You are responsible for maintaining the confidentiality of your credentials. Oryno is not liable for data compromise resulting from weak user passwords or compromised client devices.
                    </p>
                  </section>

                  <section id="updates">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">10. Updates to This Policy</h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                      We may update this Policy to reflect changes in our technology or legal obligations. Material changes will be notified via the Service or email. Continued use of the Service after such updates constitutes acceptance of the revised Policy.
                    </p>
                  </section>

                  <section id="contact">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">11. Contact</h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                      For inquiries regarding this Policy or our data practices, please contact:{' '}
                      <a href="mailto:oryno80@gmail.com" className="text-primary hover:underline">
                        oryno80@gmail.com
                      </a>
                    </p>
                  </section>
                </div>
              </article>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}