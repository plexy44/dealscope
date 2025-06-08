
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Privacy Policy - dealscope',
  description: 'Read the Privacy Policy for dealscope by DealScope UK.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="sticky top-0 z-50 w-full h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"></div>}>
        <Header />
      </Suspense>
      <main className="flex-grow container mx-auto px-4 py-12">
        <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-4xl mx-auto font-mono bg-card text-card-foreground p-6 sm:p-8 rounded-lg shadow">
          <h1 className="text-3xl font-mono font-semibold mb-8 text-primary">Privacy Policy</h1>

          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <p className="mb-4">DealScope UK (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;) operates the dealscope website (the &quot;Service&quot;).</p>
          <p className="mb-4">This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
          <p className="mb-4">We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">1. Information Collection and Use</h2>
          <p className="mb-4">We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          
          <h3 className="text-xl font-mono font-semibold mt-4 mb-2 text-primary/90">Types of Data Collected</h3>
          <h4 className="text-lg font-mono font-semibold mt-3 mb-1 text-primary/80">Personal Data</h4>
          <p className="mb-4">While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (&quot;Personal Data&quot;). Personally identifiable information may include, but is not limited to:</p>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li>Email address (if you create an account or subscribe)</li>
            <li>First name and last name (if you provide it)</li>
            <li>Cookies and Usage Data</li>
          </ul>

          <h4 className="text-lg font-mono font-semibold mt-3 mb-1 text-primary/80">Usage Data</h4>
          <p className="mb-4">We may also collect information on how the Service is accessed and used (&quot;Usage Data&quot;). This UsageData may include information such as your computer&apos;s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
          <p className="mb-4">Our website uses Google Analytics to collect information about the use of our website. Google Analytics collects information such as how often users visit our website, what pages they visit when they do so, and what other sites they used prior to coming to our website. We use the information we get from Google Analytics only to improve our website. Google Analytics collects only the IP address assigned to you on the date you visit our website, rather than your name or other identifying information. We do not combine the information collected through the use of Google Analytics with personally identifiable information. Although Google Analytics plants a permanent cookie on your web browser to identify you as a unique user the next time you visit our website, the cookie cannot be used by anyone but Google. Google’s ability to use and share information collected by Google Analytics about your visits to our website is restricted by the Google Analytics Terms of Use and the Google Privacy Policy.</p>

          <h4 className="text-lg font-mono font-semibold mt-3 mb-1 text-primary/80">Tracking & Cookies Data</h4>
          <p className="mb-4">We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</p>
          <p className="mb-4">Cookies are files with small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.</p>
          <p className="mb-4">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>
          <p className="mb-4">Examples of Cookies we use:</p>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li><strong>Session Cookies.</strong> We use Session Cookies to operate our Service.</li>
            <li><strong>Preference Cookies.</strong> We use Preference Cookies to remember your preferences and various settings.</li>
            <li><strong>Security Cookies.</strong> We use Security Cookies for security purposes.</li>
          </ul>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">2. Use of Data</h2>
          <p className="mb-4">DealScope UK uses the collected data for various purposes:</p>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer care and support</li>
            <li>To provide analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">3. Transfer Of Data</h2>
          <p className="mb-4">Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.</p>
          <p className="mb-4">If you are located outside the United Kingdom and choose to provide information to us, please note that we transfer the data, including Personal Data, to the United Kingdom and process it there.</p>
          <p className="mb-4">Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>
          <p className="mb-4">DealScope UK will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.</p>
          
          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">4. Disclosure Of Data</h2>
          <h3 className="text-xl font-mono font-semibold mt-4 mb-2 text-primary/90">Legal Requirements</h3>
          <p className="mb-4">DealScope UK may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li>To comply with a legal obligation</li>
            <li>To protect and defend the rights or property of DealScope UK</li>
            <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
            <li>To protect the personal safety of users of the Service or the public</li>
            <li>To protect against legal liability</li>
          </ul>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">5. Security Of Data</h2>
          <p className="mb-4">The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
          
          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">6. Service Providers</h2>
          <p className="mb-4">We may employ third party companies and individuals to facilitate our Service (&quot;Service Providers&quot;), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.</p>
          <p className="mb-4">These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">7. Links To Other Sites</h2>
          <p className="mb-4">Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party&apos;s site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
          <p className="mb-4">We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">8. Children&apos;s Privacy</h2>
          <p className="mb-4">Our Service does not address anyone under the age of 18 (&quot;Children&quot;).</p>
          <p className="mb-4">We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">9. Changes To This Privacy Policy</h2>
          <p className="mb-4">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
          <p className="mb-4">We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the &quot;last updated&quot; date at the top of this Privacy Policy.</p>
          <p className="mb-4">You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at contact@dealscope.uk.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
