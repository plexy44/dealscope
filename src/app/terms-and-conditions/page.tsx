
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Terms and Conditions - dealscope',
  description: 'Read the Terms and Conditions for using dealscope by DealScope UK.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="sticky top-0 z-50 w-full h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"></div>}>
        <Header />
      </Suspense>
      <main className="flex-grow container mx-auto px-4 py-12">
        <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-4xl mx-auto font-mono bg-card text-card-foreground p-6 sm:p-8 rounded-lg shadow">
          <h1 className="text-3xl font-mono font-semibold mb-8 text-primary">Terms and Conditions</h1>
          
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <p className="mb-4">Please read these Terms and Conditions (&quot;Terms&quot;, &quot;Terms and Conditions&quot;) carefully before using the dealscope website (the &quot;Service&quot;) operated by DealScope UK (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).</p>

          <p className="mb-4">Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

          <p className="mb-4">By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">1. Accounts</h2>
          <p className="mb-4">When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p className="mb-4">You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
          <p className="mb-4">You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">2. Intellectual Property</h2>
          <p className="mb-4">The Service and its original content, features, and functionality are and will remain the exclusive property of DealScope UK and its licensors. The Service is protected by copyright, trademark, and other laws of both the United Kingdom and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of DealScope UK.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">3. Links To Other Web Sites</h2>
          <p className="mb-4">Our Service may contain links to third-party web sites or services that are not owned or controlled by DealScope UK.</p>
          <p className="mb-4">DealScope UK has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that DealScope UK shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
          <p className="mb-4">We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or services that you visit.</p>
          
          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">4. eBay Affiliate Links</h2>
          <p className="mb-4">DealScope UK participates in the eBay Partner Network, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to eBay. As part of this program, some of the links to eBay on our Service are affiliate links. This means that if you click on the link and purchase the item, DealScope UK may receive an affiliate commission at no extra cost to you.</p>
          <p className="mb-4">Our use of affiliate links does not influence the deals or products we showcase. We aim to provide the best possible deals to our users regardless of affiliate relationships.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">5. Limitation Of Liability</h2>
          <p className="mb-4">In no event shall DealScope UK, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
          
          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">6. Disclaimer</h2>
          <p className="mb-4">Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
          <p className="mb-4">DealScope UK its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.</p>
          <p className="mb-4">DealScope UK does not sell any products directly. All transactions are conducted on eBay or other third-party platforms. We are not responsible for the quality, safety, legality, or any other aspect of the items listed or the transactions conducted.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">7. Governing Law</h2>
          <p className="mb-4">These Terms shall be governed and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions.</p>
          <p className="mb-4">Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">8. Changes</h2>
          <p className="mb-4">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          <p className="mb-4">By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

          <h2 className="text-2xl font-mono font-semibold mt-6 mb-4 text-primary">Contact Us</h2>
          <p className="mb-4">If you have any questions about these Terms, please contact us at contact@dealscope.uk.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
