/* @refresh reload */
import {createEffect, type JSXElement} from "solid-js"
import {UserContext, useUserDocument as useUser} from ":/domain/user/user.ts"
import {useNavigate} from "@solidjs/router"
import {useUserId} from ":/domain/user/user-id.ts"

export default function User(props: {children?: JSXElement}) {
	const nav = useNavigate()
	const [userId] = useUserId()
	createEffect(() => userId() || nav("/"))
	const user = useUser()
	return (
		<UserContext.Provider value={user}>{props.children}</UserContext.Provider>
	)
}
