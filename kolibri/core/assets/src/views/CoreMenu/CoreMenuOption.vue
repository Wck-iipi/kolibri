<template>

  <div>
    <!-- routes that have subpaths -->
    <li v-if="subRoutes && subRoutes.length > 0">
      <a
        ref="menuItem"
        class="core-menu-option"
        role="menuitem"
        :class="$computedClass(optionStyle)"
        tabindex="0"
        @click="visibleSubMenu = !visibleSubMenu"
        @keydown.enter="visibleSubMenu = !visibleSubMenu"
      >
        <slot>
          <KLabeledIcon :iconAfter="iconAfter" :data-testid="`icon-${iconAfter}`">
            <template v-if="icon" #icon>
              <KIcon :icon="icon" :color="optionIconColor" :data-testid="`icon-${icon}`" />
            </template>
            <div v-if="label">{{ label }}</div>
          </KLabeledIcon>
          <div v-if="secondaryText">{{ secondaryText }}</div>
        </slot>
      </a>
    </li>
    <li v-else>
      <a
        ref="menuItem"
        :href="link"
        class="core-menu-option"
        role="menuitem"
        :class="$computedClass(optionStyle)"
        tabindex="0"
        @click="conditionalEmit"
        @keydown.enter="conditionalEmit"
      >
        <slot>
          <KLabeledIcon>
            <template v-if="icon" #icon>
              <KIcon :icon="icon" :color="optionIconColor" :data-testid="`icon-${icon}`" />
            </template>
            <div v-if="label">{{ label }}</div>
          </KLabeledIcon>
          <div v-if="secondaryText">{{ secondaryText }}</div>
        </slot>
      </a>
    </li>

    <div v-if="visibleSubMenu">
      <div v-for="subRoute in subRoutes" :key="subRoute.label">
        <div class="link-container">
          <router-link
            v-if="linkActive"
            v-slot="{ href, navigate, isActive }"
            :to="{ name: subRoute.name, params: $route.params, query: $router.query }"
          >
            <a
              class="link"
              :href="href"
              :class="isActive ? subRouteActiveClass : subRouteInactiveClass"
              @click="e => isActive ? toggleMenu() : toggleMenu() && navigate(e)"
            >
              {{ subRoute.label }}
            </a>
          </router-link>
          <a
            v-else
            :href="generateNavRoute(subRoute.route)"
            class="link"
            :class="subRouteInactiveClass"
          >
            {{ subRoute.label }}
          </a>
        </div>
      </div>
    </div>

  </div>

</template>


<script>

  import commonCoreStrings from 'kolibri.coreVue.mixins.commonCoreStrings';
  import { generateNavRoute } from '../../utils/generateNavRoutes';

  export default {
    name: 'CoreMenuOption',
    mixins: [commonCoreStrings],
    props: {
      label: {
        type: String,
        required: false,
        default: '',
      },
      link: {
        type: String,
        default: null,
      },
      secondaryText: {
        type: String,
        default: null,
      },
      icon: {
        type: String,
        required: false,
        default: '',
      },
      subRoutes: {
        type: Array,
        required: false,
        default: () => [],
        // subRoutes should be an array of objects with the name, label, and route properties
        validate: subRoutes => subRoutes.every(route => route.name && route.label && route.route),
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        visibleSubMenu: false,
      };
    },
    computed: {
      linkActive() {
        return window.location.pathname == this.link;
      },
      optionStyle() {
        if (this.disabled) {
          return {
            color: this.$themeTokens.textDisabled,
            margin: '8px',
          };
        }
        if (this.linkActive) {
          return {
            color: this.$themeTokens.primaryDark,
            fontWeight: 'bold',
            margin: '8px',
            backgroundColor: this.$themeBrand.primary.v_50,
            ':hover': {
              backgroundColor: this.$themeBrand.primary.v_100,
            },
            ':focus': this.$coreOutline,
          };
        }
        return {
          color: this.$themeTokens.text,
          ':hover': {
            backgroundColor: this.$themeBrand.primary.v_50,
          },
          ':focus': this.$coreOutline,
        };
      },
      optionIconColor() {
        if (this.disabled) {
          return this.$themeTokens.textDisabled;
        } else if (this.active) {
          return this.$themeTokens.primary;
        } else {
          return null;
        }
      },
      iconAfter() {
        return this.visibleSubMenu ? 'chevronUp' : 'chevronDown';
      },
      subRouteActiveClass() {
        return this.$computedClass({
          color: this.$themeTokens.primaryDark,
          fontWeight: 'bold',
          textDecoration: 'none',
        });
      },
      subRouteInactiveClass() {
        return this.$computedClass({
          color: this.$themeTokens.text,
          textDecoration: 'none',
          ':hover': {
            color: this.$themeTokens.primaryDark,
            fontWeight: 'bold',
          },
          ':focus': this.$coreOutline,
        });
      },
    },
    mounted() {
      this.submenuShouldBeOpen();
    },
    methods: {
      submenuShouldBeOpen() {
        if (this.subRoutes && this.subRoutes.length > 0) {
          window.location.pathname === this.link
            ? (this.visibleSubMenu = true)
            : (this.visibleSubMenu = false);
        }
        return false;
      },
      toggleMenu() {
        if (!this.disabled) {
          this.$emit('toggleMenu');
        }
        return true;
      },
      generateNavRoute(route) {
        const params = this.$route.params;
        return generateNavRoute(this.link, route, params);
      },
      conditionalEmit() {
        if (this.disabled || this.link) {
          return;
        }
        this.$emit('select');
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri-design-system/lib/styles/definitions';

  .core-menu-option {
    display: block;
    padding: 8px;
    margin: 4px 8px;
    font-size: 16px;
    text-decoration: none;
    cursor: pointer;
    border-radius: $radius;
    outline-offset: -1px; // override global styles
    transition: background-color $core-time ease;

    &:hover {
      outline-offset: -1px; // override global styles
    }
  }

  .link-container {
    height: 44px;
  }

  .link {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 44px;
    margin: 0 40px;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;

    /deep/ .link-text {
      text-decoration: none !important;
    }
  }

  .nav-menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
  }

  button {
    margin-top: -6px;
  }

</style>
