import React from 'react'
import Settings from '../../components/Settings'
import * as c from "./SettingsPage.module.scss"

function SettingsPage() {
  return (
    <div className={c.container}>
        <Settings/>
    </div>
  )
}

export default SettingsPage