from locust import HttpUser, task

class WebTask(HttpUser):
    @task
    def register(self):
        self.client.post(
            "/register",
            json={
                "key_id": "1",
                "user_id": "1",
                "id_public_key": "1",
                "prekey_pub": "1",
                "signed_prekey_pub": "1",
                "signature": "1",
                "user_sign": "1",
                "address": "0xf5d89c31411e5f06b7910f538dfb2f5052e8c7bb"
            }
        )
