import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'Create Rooms',
    description: 'Start your own rooms and organize conversations around the topics you want.',
    icon: 'bi-plus-square',
  },
  {
    title: 'Public & Private Rooms',
    description: 'Choose whether a room is open to everyone or access-controlled.',
    icon: 'bi-shield-lock',
  },
  {
    title: 'Instant Join for Public Rooms',
    description: 'Public rooms can be joined immediately with no extra approval step.',
    icon: 'bi-door-open',
  },
  {
    title: 'Join Requests for Private Rooms',
    description: 'Private rooms require a request before someone can get inside.',
    icon: 'bi-send-check',
  },
  {
    title: 'Owner Request Approval',
    description: 'Room owners can review incoming requests and decide who gets access.',
    icon: 'bi-person-check',
  },
  {
    title: 'Room Messaging',
    description: 'Members can send messages and talk together inside each room.',
    icon: 'bi-chat-left-text',
  },
  {
    title: 'Member Visibility',
    description: 'See who is currently part of a room so conversations feel more connected.',
    icon: 'bi-people',
  },
];

function About() {
  return (
    <div className="container-fluid py-4 px-3 px-lg-4 detail-page-shell about-page">
      <section className="about-hero-card soft-enter-panel mb-4 mb-xl-5">
        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-xl-7">
            <div className="about-story-panel h-100">
              <div className="placeholder-page-label about-story-label">Story / Note</div>
              <div className="about-story-copy" dir="rtl">
                {'اخويا اليوزر الرائع , سعيد بوصولك للصفحة دي  اتمنى تكون مبسوط معانا فال app الطرش جدا دا\n'
                  + 'بص بقا يفنان هدفي من البتاع دا كان مجرد اني اتعلم باك و بس اصلا ف هو متوقعتش انه يوسع مني للصورة دي يعني انا اصلا بدأته و مكنتش اعرف يعني ايه http req حتى , فكونه وصل للمرحلة دي بعد معاناة شهرين تقريبا ف دا انجاز رائع موت\n'
                  + 'لازال في حاجات كتير ناقصة هتلاقي معظمها ف صفحة ال '}
                <Link to="/updates" className="about-story-link">updates</Link>
                {' ولكن دول ان شاء الله متشالين ل phase 3 حسب م انا مقسمها لان phase 2 هتبقا شغل deploy و devops و الهدف الاساسي من بناء التطبيق كانت المرحلة دي , لأن هو حاليا معموله deploy بطريقة عبثية موت يعني غالبا هيفضل شغال لمدة 3 ايام بالكتير قوي مثلا لان ال backend و ال database موجودين عاللاب بتاعي اصلا ف لو قفلت اللاب مثلا او مفيش نت عندي ف بالسلامة ال app مش هيشتغل معاك و الموضوع غالبا هيبقا فيه security issues كتير 🙂 , ف عشان كدا فالوقت الحالي دي مجرد مرحلة تيست مش اكتر جرب مثلا تعمل روم او اتنين و تبعتلك كام مسدج كدا و خلاص لانه لسة لازال مش حاجة يعتمد عليها بشكل كامل و لكنه لذيذ الى الان و ان شاء الله على مدار الفترة الجاية يتطور لحاجات احسن من كدا\n'
                  + 'ف بس كدا have fun بقا ❤️😘'}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="about-sticker-slot h-100">
              <div className="about-sticker-chip">Sticker Placeholder</div>
              <div className="about-sticker-frame">
                <i className="bi bi-emoji-smile about-sticker-icon" aria-hidden="true" />
                <h3 className="h5 mb-2">Add sticker here later</h3>
                <p className="text-secondary mb-0">
                  A dedicated media slot for a funny image, meme, or mascot sticker whenever you are ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-enter-panel" aria-labelledby="about-features-heading">
        <div className="about-section-heading mb-3 mb-lg-4">
          <div>
            <div className="placeholder-page-label">Current Features</div>
            <h2 id="about-features-heading" className="mb-2">What Mates Can Do Right Now</h2>
            <p className="text-secondary mb-0">
              The current version already covers the core room flow: creating spaces, controlling access, and chatting with other members.
            </p>
          </div>
        </div>

        <div className="row g-3 g-lg-4">
          {featureCards.map((feature) => (
            <div className="col-12 col-md-6 col-xl-4" key={feature.title}>
              <article className="about-feature-card h-100">
                <div className="about-feature-icon"><i className={`bi ${feature.icon}`} aria-hidden="true" /></div>
                <h3 className="h5 mb-2">{feature.title}</h3>
                <p className="text-secondary mb-0">{feature.description}</p>
              </article>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;
