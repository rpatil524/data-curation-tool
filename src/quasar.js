import Vue from 'vue'

import './styles/quasar.styl'
import 'quasar/dist/quasar.ie.polyfills'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import {
  Quasar,
  QLayout,
  QHeader,
  QDrawer,
  QPageContainer,
  QPage,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QItem,
  QItemSection,
  QItemLabel,
  Dialog,
  QAvatar,
  QSeparator,
  QCard,
  QCardSection,
  QInput,
  QExpansionItem,
  QStepper,
  QStep,
  QStepperNavigation,
  LoadingBar,
  Loading,
  QSplitter,
  QSelect,
  QSpinner,
  QSpinnerTail,
  QTable,
  QTd,
  QTr,
  QBadge,
  QPopupEdit,
  QSpace,
  QTooltip,
  Notify,
  AppFullscreen,
  QTree,
  QScrollArea
} from 'quasar'

Vue.use(Quasar, {
  config: {
    loadingBar: {
      color: 'primary',
      size: '4px'
    },
    loading: {
      spinner: QSpinnerTail,
      spinnerSize: '65px'
    },
    notify: {
      textColor: 'white',
      timeout: 1500,
      position: 'top',
      classes: 'notify-opacity',
      actions: [ { icon: 'clear', color: 'white' } ]
    }
  },
  components: {
    QLayout,
    QHeader,
    QDrawer,
    QPageContainer,
    QPage,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QItem,
    QItemSection,
    QItemLabel,
    QAvatar,
    QSeparator,
    QCard,
    QCardSection,
    QInput,
    QExpansionItem,
    QStepper,
    QStep,
    QStepperNavigation,
    QSplitter,
    QSelect,
    QSpinner,
    QSpinnerTail,
    QTable,
    QTd,
    QTr,
    QBadge,
    QPopupEdit,
    QSpace,
    QTooltip,
    QTree,
    QScrollArea
  },
  directives: {
  },
  plugins: {
    Dialog,
    LoadingBar,
    Loading,
    Notify,
    AppFullscreen
  }
 })
