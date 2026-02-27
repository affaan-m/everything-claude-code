# Mobile Accessibility

## Overview

Mobile accessibility ensures apps work for users with disabilities on iOS and Android devices. This includes support for screen readers (VoiceOver, TalkBack), motor impairments, and various visual disabilities.

## Touch Target Sizing

### Minimum Sizes

```css
/* WCAG 2.2 Level AA: 24x24px minimum */
.interactive-element {
  min-width: 24px;
  min-height: 24px;
}

/* WCAG 2.2 Level AAA / Apple HIG / Material Design: 44x44dp */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Android Material Design: 48x48dp recommended */
.android-touch-target {
  min-width: 48px;
  min-height: 48px;
}
```

### Touch Target Spacing

```tsx
// Ensure adequate spacing between touch targets
function ButtonGroup({ buttons }) {
  return (
    <div className="flex gap-3">
      {" "}
      {/* 12px minimum gap */}
      {buttons.map((btn) => (
        <button key={btn.id} className="min-w-[44px] min-h-[44px] px-4 py-2">
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// Expanding hit area without changing visual size
function IconButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative p-3" // Creates 44x44 touch area
    >
      <span className="block w-5 h-5">{icon}</span>
    </button>
  );
}
```

## iOS VoiceOver

### React Native Accessibility Props

```tsx
import { View, Text, TouchableOpacity, AccessibilityInfo } from "react-native";

// Basic accessible button
function AccessibleButton({ onPress, title, hint }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={true}
      accessibilityLabel={title}
      accessibilityHint={hint}
      accessibilityRole="button"
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

// Complex component with grouped content
function ProductCard({ product }) {
  return (
    <View
      accessible={true}
      accessibilityLabel={`${product.name}, ${product.price}, ${product.rating} stars`}
      accessibilityRole="button"
      accessibilityActions={[
        { name: "activate", label: "View details" },
        { name: "addToCart", label: "Add to cart" },
      ]}
      onAccessibilityAction={(event) => {
        switch (event.nativeEvent.actionName) {
          case "addToCart":
            addToCart(product);
            break;
          case "activate":
            viewDetails(product);
            break;
        }
      }}
    >
      <Image source={product.image} accessibilityIgnoresInvertColors />
      <Text>{product.name}</Text>
      <Text>{product.price}</Text>
    </View>
  );
}

// Announcing dynamic changes
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount((prev) => prev + 1);
    AccessibilityInfo.announceForAccessibility(`Count is now ${count + 1}`);
  };

  return (
    <View>
      <Text accessibilityRole="text" accessibilityLiveRegion="polite">
        Count: {count}
      </Text>
      <TouchableOpacity
        onPress={increment}
        accessibilityLabel="Increment"
        accessibilityHint="Increases the counter by one"
      >
        <Text>+</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### SwiftUI Accessibility

```swift
import SwiftUI

struct AccessibleButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .accessibilityLabel(title)
        .accessibilityHint("Double tap to activate")
        .accessibilityAddTraits(.isButton)
    }
}

struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack {
            AsyncImage(url: product.imageURL)
                .accessibilityHidden(true) // Image is decorative

            Text(product.name)
            Text(product.price.formatted(.currency(code: "USD")))
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(product.name), \(product.price.formatted(.currency(code: "USD")))")
        .accessibilityHint("Double tap to view details")
        .accessibilityAction(named: "Add to cart") {
            addToCart(product)
        }
    }
}

// Custom accessibility rotor
struct DocumentView: View {
    let sections: [Section]

    var body: some View {
        ScrollView {
            ForEach(sections) { section in
                Text(section.title)
                    .font(.headline)
                    .accessibilityAddTraits(.isHeader)
                Text(section.content)
            }
        }
        .accessibilityRotor("Headings") {
            ForEach(sections) { section in
                AccessibilityRotorEntry(section.title, id: section.id)
            }
        }
    }
}
```

## Android TalkBack

### Jetpack Compose Accessibility

```kotlin
import androidx.compose.ui.semantics.*

@Composable
fun AccessibleButton(
    onClick: () -> Unit,
    text: String,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.semantics {
            contentDescription = text
            role = Role.Button
            if (!enabled) {
                disabled()
            }
        }
    ) {
        Text(text)
    }
}

@Composable
fun ProductCard(product: Product) {
    Card(
        modifier = Modifier
            .semantics(mergeDescendants = true) {
                contentDescription = "${product.name}, ${product.formattedPrice}"
                customActions = listOf(
                    CustomAccessibilityAction("Add to cart") {
                        addToCart(product)
                        true
                    }
                )
            }
            .clickable { navigateToDetails(product) }
    ) {
        Image(
            painter = painterResource(product.imageRes),
            contentDescription = null, // Decorative
            modifier = Modifier.semantics { invisibleToUser() }
        )
        Text(product.name)
        Text(product.formattedPrice)
    }
}

// Live region for dynamic content
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }

    Column {
        Text(
            text = "Count: $count",
            modifier = Modifier.semantics {
                liveRegion = LiveRegionMode.Polite
            }
        )
        Button(onClick = { count++ }) {
            Text("Increment")
        }
    }
}

// Heading levels
@Composable
fun SectionHeader(title: String, level: Int) {
    Text(
        text = title,
        style = MaterialTheme.typography.headlineMedium,
        modifier = Modifier.semantics {
            heading()
            // Custom heading level (not built-in)
            testTag = "heading-$level"
        }
    )
}
```

### Android XML Views

```xml
<!-- Accessible button -->
<Button
    android:id="@+id/submit_button"
    android:layout_width="wrap_content"
    android:layout_height="48dp"
    android:minWidth="48dp"
    android:text="@string/submit"
    android:contentDescription="@string/submit_form" />

<!-- Grouped content -->
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:importantForAccessibility="yes"
    android:focusable="true"
    android:contentDescription="@string/product_description">

    <ImageView
        android:importantForAccessibility="no"
        android:src="@drawable/product" />

    <TextView
        android:text="@string/product_name"
        android:importantForAccessibility="no" />
</LinearLayout>

<!-- Live region -->
<TextView
    android:id="@+id/status"
    android:accessibilityLiveRegion="polite" />
```

```kotlin
// Kotlin accessibility
binding.submitButton.apply {
    contentDescription = getString(R.string.submit_form)
    accessibilityDelegate = object : View.AccessibilityDelegate() {
        override fun onInitializeAccessibilityNodeInfo(
            host: View,
            info: AccessibilityNodeInfo
        ) {
            super.onInitializeAccessibilityNodeInfo(host, info)
            info.addAction(
                AccessibilityNodeInfo.AccessibilityAction(
                    AccessibilityNodeInfo.ACTION_CLICK,
                    getString(R.string.submit_action)
                )
            )
        }
    }
}

// Announce changes
binding.counter.announceForAccessibility("Count updated to $count")
```

## Gesture Accessibility

### Alternative Gestures

```tsx
// React Native: Provide alternatives to complex gestures
function SwipeableCard({ item, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <View
      accessible={true}
      accessibilityActions={[{ name: "delete", label: "Delete item" }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "delete") {
          onDelete(item);
        }
      }}
    >
      <Swipeable
        renderRightActions={() => (
          <TouchableOpacity
            onPress={() => onDelete(item)}
            accessibilityLabel="Delete"
          >
            <Text>Delete</Text>
          </TouchableOpacity>
        )}
      >
        <Text>{item.title}</Text>
      </Swipeable>

      {/* Alternative for screen reader users */}
      <TouchableOpacity
        accessibilityLabel={`Delete ${item.title}`}
        onPress={() => onDelete(item)}
        style={{ position: "absolute", right: 0 }}
      >
        <Text>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Motion and Animation

```tsx
// Respect reduced motion preference
import { AccessibilityInfo } from "react-native";

function AnimatedComponent() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => subscription.remove();
  }, []);

  return (
    <Animated.View
      style={{
        transform: reduceMotion ? [] : [{ translateX: animatedValue }],
        opacity: reduceMotion ? 1 : animatedOpacity,
      }}
    >
      <Content />
    </Animated.View>
  );
}
```

## Dynamic Type / Text Scaling

### iOS Dynamic Type

```swift
// SwiftUI
Text("Hello, World!")
    .font(.body) // Automatically scales with Dynamic Type

Text("Fixed Size")
    .font(.system(size: 16, design: .default))
    .dynamicTypeSize(.large) // Cap at large

// Allow unlimited scaling
Text("Scalable")
    .font(.body)
    .minimumScaleFactor(0.5)
    .lineLimit(nil)
```

### Android Text Scaling

```xml
<!-- Use sp for text sizes -->
<TextView
    android:textSize="16sp"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content" />

<!-- In styles.xml -->
<style name="TextAppearance.Body">
    <item name="android:textSize">16sp</item>
    <item name="android:lineHeight">24sp</item>
</style>
```

```kotlin
// Compose: Text automatically scales
Text(
    text = "Hello, World!",
    style = MaterialTheme.typography.bodyLarge
)

// Limit scaling if needed
Text(
    text = "Limited scaling",
    fontSize = 16.sp,
    maxLines = 2,
    overflow = TextOverflow.Ellipsis
)
```

### React Native Text Scaling

```tsx
import { Text, PixelRatio } from 'react-native';

// Allow text scaling (default)
<Text allowFontScaling={true}>Scalable text</Text>

// Limit maximum scale
<Text maxFontSizeMultiplier={1.5}>Limited scaling</Text>

// Disable scaling (use sparingly)
<Text allowFontScaling={false}>Fixed size</Text>

// Responsive font size
const scaledFontSize = (size: number) => {
  const scale = PixelRatio.getFontScale();
  return size * Math.min(scale, 1.5); // Cap at 1.5x
};
```

## Testing Checklist

```markdown
## VoiceOver (iOS) Testing

- [ ] All interactive elements have labels
- [ ] Swipe navigation covers all content in logical order
- [ ] Custom actions available for complex interactions
- [ ] Announcements made for dynamic content
- [ ] Headings navigable via rotor
- [ ] Images have appropriate descriptions or are hidden

## TalkBack (Android) Testing

- [ ] Focus order is logical
- [ ] Touch exploration works correctly
- [ ] Custom actions available
- [ ] Live regions announce updates
- [ ] Headings properly marked
- [ ] Grouped content read together

## Motor Accessibility

- [ ] Touch targets at least 44x44 points
- [ ] Adequate spacing between targets (8dp minimum)
- [ ] Alternatives to complex gestures
- [ ] No time-limited interactions

## Visual Accessibility

- [ ] Text scales to 200% without loss
- [ ] Content visible in high contrast mode
- [ ] Color not sole indicator
- [ ] Animations respect reduced motion
```

## Resources

- [Apple Accessibility Programming Guide](https://developer.apple.com/accessibility/)
- [Android Accessibility Developer Guide](https://developer.android.com/guide/topics/ui/accessibility)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Mobile Accessibility WCAG](https://www.w3.org/TR/mobile-accessibility-mapping/)
