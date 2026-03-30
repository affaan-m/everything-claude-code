No,Category,Issue,Platform,Description,Do,Don't,Code Example Good,Code Example Bad,Severity
1,Navigation,Smooth Scroll,Web,Anchor links should scroll smoothly to target section,Use scroll-behavior: smooth on html element,Jump directly without transition,html { scroll-behavior: smooth; },<a href='#section'> without CSS,High
2,Navigation,Sticky Navigation,Web,Fixed nav should not obscure content,Add padding-top to body equal to nav height,Let nav overlap first section content,pt-20 (if nav is h-20),No padding compensation,Medium
3,Navigation,Active State,All,Current page/section should be visually indicated,Highlight active nav item with color/underline,No visual feedback on current location,text-primary border-b-2,All links same style,Medium
4,Navigation,Back Button,Mobile,Users expect back to work predictably,Preserve navigation history properly,Break browser/app back button behavior,history.pushState(),location.replace(),High
5,Navigation,Deep Linking,All,URLs should reflect current state for sharing,Update URL on state/view changes,Static URLs for dynamic content,Use query params or hash,Single URL for all states,Medium
6,Navigation,Breadcrumbs,Web,Show user location in site hierarchy,Use for sites with 3+ levels of depth,Use for flat single-level sites,Home > Category > Product,Only on deep nested pages,Low
7,Animation,Excessive Motion,All,Too many animations cause distraction and motion sickness,Animate 1-2 key elements per view maximum,Animate everything that moves,Single hero animation,animate-bounce on 5+ elements,High
8,Animation,Duration Timing,All,Animations should feel responsive not sluggish,Use 150-300ms for micro-interactions,Use animations longer than 500ms for UI,transition-all duration-200,duration-1000,Medium
9,Animation,Reduced Motion,All,Respect user's motion preferences,Check prefers-reduced-motion media query,Ignore accessibility motion settings,@media (prefers-reduced-motion: reduce),No motion query check,High
10,Animation,Loading States,All,Show feedback during async operations,Use skeleton screens or spinners,Leave UI frozen with no feedback,animate-pulse skeleton,Blank screen while loading,High
11,Animation,Hover vs Tap,All,Hover effects don't work on touch devices,Use click/tap for primary interactions,Rely only on hover for important actions,onClick handler,onMouseEnter only,High
12,Animation,Continuous Animation,All,Infinite animations are distracting,Use for loading indicators only,Use for decorative elements,animate-spin on loader,animate-bounce on icons,Medium
13,Animation,Transform Performance,Web,Some CSS properties trigger expensive repaints,Use transform and opacity for animations,Animate width/height/top/left properties,transform: translateY(),top: 10px animation,Medium
14,Animation,Easing Functions,All,Linear motion feels robotic,Use ease-out for entering ease-in for exiting,Use linear for UI transitions,ease-out,linear,Low
15,Layout,Z-Index Management,Web,Stacking context conflicts cause hidden elements,Define z-index scale system (10 20 30 50),Use arbitrary large z-index values,z-10 z-20 z-50,z-[9999],High
16,Layout,Overflow Hidden,Web,Hidden overflow can clip important content,Test all content fits within containers,Blindly apply overflow-hidden,overflow-auto with scroll,overflow-hidden truncating content,Medium
17,Layout,Fixed Positioning,Web,Fixed elements can overlap or be inaccessible,Account for safe areas and other fixed elements,Stack multiple fixed elements carelessly,Fixed nav + fixed bottom with gap,Multiple overlapping fixed elements,Medium
18,Layout,Stacking Context,Web,New stacking contexts reset z-index,Understand what creates new stacking context,Expect z-index to work across contexts,Parent with z-index isolates children,z-index: 9999 not working,Medium
19,Layout,Content Jumping,Web,Layout shift when content loads is jarring,Reserve space for async content,Let images/content push layout around,aspect-ratio or fixed height,No dimensions on images,High
20,Layout,Viewport Units,Web,100vh can be problematic on mobile browsers,Use dvh or account for mobile browser chrome,Use 100vh for full-screen mobile layouts,min-h-dvh or min-h-screen,h-screen on mobile,Medium
21,Layout,Container Width,Web,Content too wide is hard to read,Limit max-width for text content (65-75ch),Let text span full viewport width,max-w-prose or max-w-3xl,Full width paragraphs,Medium
22,Touch,Touch Target Size,Mobile,Small buttons are hard to tap accurately,Minimum 44x44px touch targets,Tiny clickable areas,min-h-[44px] min-w-[44px],w-6 h-6 buttons,High
23,Touch,Touch Spacing,Mobile,Adjacent touch targets need adequate spacing,Minimum 8px gap between touch targets,Tightly packed clickable elements,gap-2 between buttons,gap-0 or gap-1,Medium
24,Touch,Gesture Conflicts,Mobile,Custom gestures can conflict with system,Avoid horizontal swipe on main content,Override system gestures,Vertical scroll primary,Horizontal swipe carousel only,Medium
25,Touch,Tap Delay,Mobile,300ms tap delay feels laggy,Use touch-action CSS or fastclick,Default mobile tap handling,touch-action: manipulation,No touch optimization,Medium
26,Touch,Pull to Refresh,Mobile,Accidental refresh is frustrating,Disable where not needed,Enable by default everywhere,overscroll-behavior: contain,Default overscroll,Low
27,Touch,Haptic Feedback,Mobile,Tactile feedback improves interaction feel,Use for confirmations and important actions,Overuse vibration feedback,navigator.vibrate(10),Vibrate on every tap,Low
28,Interaction,Focus States,All,Keyboard users need visible focus indicators,Use visible focus rings on interactive elements,Remove focus outline without replacement,focus:ring-2 focus:ring-blue-500,outline-none without alternative,High
29,Interaction,Hover States,Web,Visual feedback on interactive elements,Change cursor and add subtle visual change,No hover feedback on clickable elements,hover:bg-gray-100 cursor-pointer,No hover style,Medium
30,Interaction,Active States,All,Show immediate feedback on press/click,Add pressed/active state visual change,No feedback during interaction,active:scale-95,No active state,Medium
31,Interaction,Disabled States,All,Clearly indicate non-interactive elements,Reduce opacity and change cursor,Confuse disabled with normal state,opacity-50 cursor-not-allowed,Same style as enabled,Medium
32,Interaction,Loading Buttons,All,Prevent double submission during async actions,Disable button and show loading state,Allow multiple clicks during processing,disabled={loading} spinner,Button clickable while loading,High
33,Interaction,Error Feedback,All,Users need to know when something fails,Show clear error messages near problem,Silent failures with no feedback,Red border + error message,No indication of error,High
34,Interaction,Success Feedback,All,Confirm successful actions to users,Show success message or visual change,No confirmation of completed action,Toast notification or checkmark,Action completes silently,Medium
35,Interaction,Confirmation Dialogs,All,Prevent accidental destructive actions,Confirm before delete/irreversible actions,Delete without confirmation,Are you sure modal,Direct delete on click,High
36,Accessibility,Color Contrast,All,Text must be readable against background,Minimum 4.5:1 ratio for normal text,Low contrast text,#333 on white (7:1),#999 on white (2.8:1),High
37,Accessibility,Color Only,All,Don't convey information by color alone,Use icons/text in addition to color,Red/green only for error/success,Red text + error icon,Red border only for error,High
38,Accessibility,Alt Text,All,Images need text alternatives,Descriptive alt text for meaningful images,Empty or missing alt attributes,alt='Dog playing in park',alt='' for content images,High
39,Accessibility,Heading Hierarchy,Web,Screen readers use headings for navigation,Use sequential heading levels h1-h6,Skip heading levels or misuse for styling,h1 then h2 then h3,h1 then h4,Medium
40,Accessibility,ARIA Labels,All,Interactive elements need accessible names,Add aria-label for icon-only buttons,Icon buttons without labels,aria-label='Close menu',<button><Icon/></button>,High
41,Accessibility,Keyboard Navigation,Web,All functionality accessible via keyboard,Tab order matches visual order,Keyboard traps or illogical tab order,tabIndex for custom order,Unreachable elements,High
42,Accessibility,Screen Reader,All,Content should make sense when read aloud,Use semantic HTML and ARIA properly,Div soup with no semantics,<nav> <main> <article>,<div> for everything,Medium
43,Accessibility,Form Labels,All,Inputs must have associated labels,Use label with for attribute or wrap input,Placeholder-only inputs,<label for='email'>,placeholder='Email' only,High
44,Accessibility,Error Messages,All,Error messages must be announced,Use aria-live or role=alert for errors,Visual-only error indication,role='alert',Red border only,High
45,Accessibility,Skip Links,Web,Allow keyboard users to skip navigation,Provide skip to main content link,No skip link on nav-heavy pages,Skip to main content link,100 tabs to reach content,Medium
46,Performance,Image Optimization,All,Large images slow page load,Use appropriate size and format (WebP),Unoptimized full-size images,srcset with multiple sizes,4000px image for 400px display,High
47,Performance,Lazy Loading,All,Load content as needed,Lazy load below-fold images and content,Load everything upfront,loading='lazy',All images eager load,Medium
48,Performance,Code Splitting,Web,Large bundles slow initial load,Split code by route/feature,Single large bundle,dynamic import(),All code in main bundle,Medium
49,Performance,Caching,Web,Repeat visits should be fast,Set appropriate cache headers,No caching strategy,Cache-Control headers,Every request hits server,Medium
50,Performance,Font Loading,Web,Web fonts can block rendering,Use font-display swap or optional,Invisible text during font load,font-display: swap,FOIT (Flash of Invisible Text),Medium
51,Performance,Third Party Scripts,Web,External scripts can block rendering,Load non-critical scripts async/defer,Synchronous third-party scripts,async or defer attribute,<script src='...'> in head,Medium
52,Performance,Bundle Size,Web,Large JavaScript slows interaction,Monitor and minimize bundle size,Ignore bundle size growth,Bundle analyzer,No size monitoring,Medium
53,Performance,Render Blocking,Web,CSS/JS can block first paint,Inline critical CSS defer non-critical,Large blocking CSS files,Critical CSS inline,All CSS in head,Medium
54,Forms,Input Labels,All,Every input needs a visible label,Always show label above or beside input,Placeholder as only label,<label>Email</label><input>,placeholder='Email' only,High
55,Forms,Error Placement,All,Errors should appear near the problem,Show error below related input,Single error message at top of form,Error under each field,All errors at form top,Medium
56,Forms,Inline Validation,All,Validate as user types or on blur,Validate on blur for most fields,Validate only on submit,onBlur validation,Submit-only validation,Medium
57,Forms,Input Types,All,Use appropriate input types,Use email tel number url etc,Text input for everything,type='email',type='text' for email,Medium
58,Forms,Autofill Support,Web,Help browsers autofill correctly,Use autocomplete attribute properly,Block or ignore autofill,autocomplete='email',autocomplete='off' everywhere,Medium
59,Forms,Required Indicators,All,Mark required fields clearly,Use asterisk or (required) text,No indication of required fields,* required indicator,Guess which are required,Medium
60,Forms,Password Visibility,All,Let users see password while typing,Toggle to show/hide password,No visibility toggle,Show/hide password button,Password always hidden,Medium
61,Forms,Submit Feedback,All,Confirm form submission status,Show loading then success/error state,No feedback after submit,Loading -> Success message,Button click with no response,High
62,Forms,Input Affordance,All,Inputs should look interactive,Use distinct input styling,Inputs that look like plain text,Border/background on inputs,Borderless inputs,Medium
63,Forms,Mobile Keyboards,Mobile,Show appropriate keyboard for input type,Use inputmode attribute,Default keyboard for all inputs,inputmode='numeric',Text keyboard for numbers,Medium
64,Responsive,Mobile First,Web,Design for mobile then enhance for larger,Start with mobile styles then add breakpoints,Desktop-first causing mobile issues,Default mobile + md: lg: xl:,Desktop default + max-width queries,Medium
65,Responsive,Breakpoint Testing,Web,Test at all common screen sizes,Test at 320 375 414 768 1024 1440,Only test on your device,Multiple device testing,Single device development,Medium
66,Responsive,Touch Friendly,Web,Mobile layouts need touch-sized targets,Increase touch targets on mobile,Same tiny buttons on mobile,Larger buttons on mobile,Desktop-sized targets on mobile,High
67,Responsive,Readable Font Size,All,Text must be readable on all devices,Minimum 16px body text on mobile,Tiny text on mobile,text-base or larger,text-xs for body text,High
68,Responsive,Viewport Meta,Web,Set viewport for mobile devices,Use width=device-width initial-scale=1,Missing or incorrect viewport,<meta name='viewport'...>,No viewport meta tag,High
69,Responsive,Horizontal Scroll,Web,Avoid horizontal scrolling,Ensure content fits viewport width,Content wider than viewport,max-w-full overflow-x-hidden,Horizontal scrollbar on mobile,High
70,Responsive,Image Scaling,Web,Images should scale with container,Use max-width: 100% on images,Fixed width images overflow,max-w-full h-auto,width='800' fixed,Medium
71,Responsive,Table Handling,Web,Tables can overflow on mobile,Use horizontal scroll or card layout,Wide tables breaking layout,overflow-x-auto wrapper,Table overflows viewport,Medium
72,Typography,Line Height,All,Adequate line height improves readability,Use 1.5-1.75 for body text,Cramped or excessive line height,leading-relaxed (1.625),leading-none (1),Medium
73,Typography,Line Length,Web,Long lines are hard to read,Limit to 65-75 characters per line,Full-width text on large screens,max-w-prose,Full viewport width text,Medium
74,Typography,Font Size Scale,All,Consistent type hierarchy aids scanning,Use consistent modular scale,Random font sizes,Type scale (12 14 16 18 24 32),Arbitrary sizes,Medium
75,Typography,Font Loading,Web,Fonts should load without layout shift,Reserve space with fallback font,Layout shift when fonts load,font-display: swap + similar fallback,No fallback font,Medium
76,Typography,Contrast Readability,All,Body text needs good contrast,Use darker text on light backgrounds,Gray text on gray background,text-gray-900 on white,text-gray-400 on gray-100,High
77,Typography,Heading Clarity,All,Headings should stand out from body,Clear size/weight difference,Headings similar to body text,Bold + larger size,Same size as body,Medium
78,Feedback,Loading Indicators,All,Show system status during waits,Show spinner/skeleton for operations > 300ms,No feedback during loading,Skeleton or spinner,Frozen UI,High
79,Feedback,Empty States,All,Guide users when no content exists,Show helpful message and action,Blank empty screens,No items yet. Create one!,Empty white space,Medium
80,Feedback,Error Recovery,All,Help users recover from errors,Provide clear next steps,Error without recovery path,Try again button + help link,Error message only,Medium
81,Feedback,Progress Indicators,All,Show progress for multi-step processes,Step indicators or progress bar,No indication of progress,Step 2 of 4 indicator,No step information,Medium
82,Feedback,Toast Notifications,All,Transient messages for non-critical info,Auto-dismiss after 3-5 seconds,Toasts that never disappear,Auto-dismiss toast,Persistent toast,Medium
83,Feedback,Confirmation Messages,All,Confirm successful actions,Brief success message,Silent success,Saved successfully toast,No confirmation,Medium
84,Content,Truncation,All,Handle long content gracefully,Truncate with ellipsis and expand option,Overflow or broken layout,line-clamp-2 with expand,Overflow or cut off,Medium
85,Content,Date Formatting,All,Use locale-appropriate date formats,Use relative or locale-aware dates,Ambiguous date formats,2 hours ago or locale format,01/02/03,Low
86,Content,Number Formatting,All,Format large numbers for readability,Use thousand separators or abbreviations,Long unformatted numbers,"1.2K or 1,234",1234567,Low
87,Content,Placeholder Content,All,Show realistic placeholders during dev,Use realistic sample data,Lorem ipsum everywhere,Real sample content,Lorem ipsum,Low
88,Onboarding,User Freedom,All,Users should be able to skip tutorials,Provide Skip and Back buttons,Force linear unskippable tour,Skip Tutorial button,Locked overlay until finished,Medium
89,Search,Autocomplete,Web,Help users find results faster,Show predictions as user types,Require full type and enter,Debounced fetch + dropdown,No suggestions,Medium
90,Search,No Results,Web,Dead ends frustrate users,Show 'No results' with suggestions,Blank screen or '0 results',Try searching for X instead,No results found.,Medium
91,Data Entry,Bulk Actions,Web,Editing one by one is tedious,Allow multi-select and bulk edit,Single row actions only,Checkbox column + Action bar,Repeated actions per row,Low
92,AI Interaction,Disclaimer,All,Users need to know they talk to AI,Clearly label AI generated content,Present AI as human,AI Assistant label,Fake human name without label,High
93,AI Interaction,Streaming,All,Waiting for full text is slow,Stream text response token by token,Show loading spinner for 10s+,Typewriter effect,Spinner until 100% complete,Medium
94,Spatial UI,Gaze Hover,VisionOS,Elements should respond to eye tracking before pinch,Scale/highlight element on look,Static element until pinch,hoverEffect(),onTap only,High
95,Spatial UI,Depth Layering,VisionOS,UI needs Z-depth to separate content from environment,Use glass material and z-offset,Flat opaque panels blocking view,.glassBackgroundEffect(),bg-white,Medium
96,Sustainability,Auto-Play Video,Web,Video consumes massive data and energy,Click-to-play or pause when off-screen,Auto-play high-res video loops,playsInline muted preload='none',autoplay loop,Medium
97,Sustainability,Asset Weight,Web,Heavy 3D/Image assets increase carbon footprint,Compress and lazy load 3D models,Load 50MB textures,Draco compression,Raw .obj files,Medium
98,AI Interaction,Feedback Loop,All,AI needs user feedback to improve,Thumps up/down or 'Regenerate',Static output only,Feedback component,Read-only text,Low
99,Accessibility,Motion Sensitivity,All,Parallax/Scroll-jacking causes nausea,Respect prefers-reduced-motion,Force scroll effects,@media (prefers-reduced-motion),ScrollTrigger.create(),High