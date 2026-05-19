import React from 'react'
import styles from '../../css/pre-login.module.css';
const PreLogin = () => {
  return (
    <div>
          <section className={`${styles['intro-banner']}`}>
              <div className="banner-overlay">
                  <div className="container-fluid intro-banner-item text-justify">
                      <h1 className={styles['bg-title']}>
                          Sell Faster With IIFL One Home
                      </h1>
                     <p className={`mt-3 ${styles['bg-description']} ${styles['bg-para']} d-none d-md-block`}>
  We offer end-to-end digital solutions for listing, marketing, and selling properties.<br/> Our pioneering <a href='https://www.iiflonehome.com/auction/info' target='_blank' style={{color:'#EA5817'}}>E-auctions</a> platform helps banks and NBFCs sell off non-performing assets (NPAs)<br/> efficiently. Developers and builders can list properties with us to access a vast network of buyers.
</p>

<p className={`mt-3 ${styles['bg-description']} ${styles['bg-para']} d-block d-md-none`}>
  Connect with buyers, simplify sales, and maximise property visibility.
</p>

                      <div className="d-flex search-container-mobile">
                          {/* search box here */}
                      </div>
                  </div>
              </div>
          </section>

      <section className="text-center py-lg-5 py-3">
        <h2 className={`${styles['bg-heading']} px-2`}>
          What Do Banks and NBFCs Gain?
        </h2>
        <p className={`mb-lg-5 mb-3 px-3 ${styles['bg-sub-heading']}`}>
          At IIFL One Home, we understand the challenges in advertising, managing, and selling real-estate. Thats why we not only make the <br />property sale process swifter and more transparent but also offer additional benefits.
        </p>
        <div className={`${styles['img-div']}`}>
          <img src="/assets/images/phone-img.png" className={`${styles['img-div']}`} alt="Why Choose IIFL One Home" />
        </div>

        <div className={`mx-lg-5 px-lg-5 px-3 ${styles['bg-para']}`}>
          {/* Row 1 */}
          <div className="row">
            <div className="col-md-4 text-center">
              <div className="text-start hover-effect2 py-3 pb-4">
                <img src="/assets/images/digital-process-icon.png" className="img-fluid" alt="digital-process-icon" />
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}> Auto bidder and EMD verification</h6>
                <p>
                  Reduce manual effort and ensure secure auction participation with the automated know-your-customer (KYC) process and payment gateway-enabled earnest money deposits (EMDs).
                </p>
              </div>
            </div>
             <div className="col-md-4 text-center">
              <div className="text-start hover-effect2 py-3 pb-4">
                <img src="/assets/images/NPA-liquidation-icon.png" className="img-fluid" alt="NPA-liquidation-icon" />
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}>Secure auctions</h6>
                <p>
                  Sell NPAs through safe, fair, and transparent e-auctions.
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="text-start hover-effect2 py-3 pb-4">
                <img src="/assets/images/effortless-listing-icon.png" className="img-fluid" alt="effortless-listing-icon" />
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}>Centralised property listings</h6>
                <p>
                  Manage multiple properties with bulk uploads. Quickly upload property images and documents through an easy and efficient process.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="row">
           <div className="col-md-4 text-center">
              <div className="text-start hover-effect2 py-3 pb-4">
                <img src="/assets/images/Lead-management-icon.png" className="img-fluid" alt="Lead-management-icon" />
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}>Analytics dashboard</h6>
                <p>
                  View, track, and analyse performances and key metrics with our intuitive analytics dashboard.
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="text-start hover-effect2 py-3 pb-4">
                <img src="/assets/images/Property-management-icon.png" className="img-fluid" alt="Property-management-icon" />
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}>Property management on the go</h6>
                <p>
                  Real estate on the go. With the upcoming OneHome app, manage listings, track leads, and monitor auctions anytime, anywhere.
                </p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="text-start hover-effect2 py-3 pb-4">
                <img src="/assets/images/Bulk-uploads-icon.png" className="img-fluid" alt="Bulk-uploads-icon" />
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}>Customised reports</h6>
                <p>
                  Create tailor-made reports on bidders, auctions, and payments. Obtain actionable insights, monitor performance, and simplify decision-making effectively.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className={`text-center py-lg-5 py-3 ${styles['linear-bg']}` }>
        <h2 className={`${styles['bg-heading']} px-2`}>
Benefits for Developers and Builders
        </h2>
        <div className={`mx-lg-5 px-lg-5 px-3 ${styles['bg-para']}`}>
          {/* Row 1 */}
          <div className="row g-4 mb-md-4">
            <div className="col-md-4">
              <div className={`${styles['card']} p-4 ${styles['card-gap']} `}>
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}>Consolidated property listings</h6>
                <p> Streamline property management with bulk uploads of multiple assets at once.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className={`${styles['card']} p-4 ${styles['card-gap']} `}>
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}>Personalised lead management</h6>
                <p> Generate leads, automate follow-ups, and showcase properties to a wider audience.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className={`${styles['card']} p-4 ${styles['card-gap']} `}>
                <h6 className={`${styles['bg-h-6']} pt-2 pb-2`}>Dashboard with integrated analytics</h6>
                <p>Manage enquiries, track performances, and obtain actionable insights on the customised dashboard.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className={`text-center py-lg-5 py-3 ${styles['bg-section']}`}>
        <h2 className={`${styles['bg-heading']} px-2`} style={{ color: '#fff' }}>
          What IIFL One Home Can Do
        </h2>
        <div className={`mx-lg-5 px-lg-5 px-3 ${styles['bg-para']}`}>
          {/* Row 1 */}
          <div className="row g-4 mb-4">
            <div className={`col-md-4 d-flex ${styles['card-gap']} `}>
              <div className={`${styles['card-140']} p-4 w-100`}>
                <p>  Attract suitable audiences.</p>
              </div>
            </div>

            <div className={`col-md-4 d-flex ${styles['card-gap']} `}>
              <div className={`${styles['card-140']} p-4 w-100`}>
                <p>Offer end-to-end digital solutions, automated processes, and personalised support.</p>
              </div>
            </div>

            <div className={`col-md-4 d-flex ${styles['card-gap']} `}>
              <div className={`${styles['card-140']} p-4 w-100`}>
                <p> Provide comprehensive <a href='https://www.iiflonehome.com/blog/what-are-property-valuation-reports-and-why-are-they-important' target='_blank'>valuation reports</a>  with actionable insights</p>
              </div>
            </div>
          </div>

           {/* Row 2 */}
          <div className="row g-4 mb-4">
            <div className={`col-md-4 d-flex ${styles['card-gap']} `}>
              <div className={`${styles['card-140']} p-4 w-100`}>
                <p>Ensure secure, transparent, and legally compliant processes.</p>
              </div>
            </div>

            <div className={`col-md-4 d-flex ${styles['card-gap']} `}>
              <div className={`${styles['card-140']} p-4 w-100`}>
                <p>Capture property performances with real-time analytics.</p>
              </div>
            </div>

            <div className={`col-md-4 d-flex ${styles['card-gap']} `}>
              <div className={`${styles['card-140']} p-4 w-100`}>
                <p>Improve internal processes with customised solutions.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className={`${styles['bg-gray']} py-lg-5 py-3`}>
        <div className='row mx-lg-5 px-lg-5 px-3'>
          <div className='col-md-7'>
            <h2 className={`${styles['bg-heading']}`} style={{padding: "16px 10px"}}>
              Book a Demo
            </h2>
            <p className={`mb-lg-5 mb-3 p-3 ${styles['bg-sub-heading']}`}>
              Say goodbye to traditional property sales and uncover a smarter way to optimise sales strategies. Whether you are a bank, NBFC, builder, developer, or agent, schedule a free demo with IIFL One Home today and experience our end-to-end digital solutions for smooth property sales or e-auctions. 
              
            </p>
          </div>
          <div className={`col-md-5 ${styles['img-w-100']}`}>
            <img src="/assets/images/book-demo.png" className={`img-fluid1 ${styles['img-w-100']}`} alt="property-listing-work" />
          </div>
        </div>
      </section>

    </div>
  )
}

export default PreLogin
